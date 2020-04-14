import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { createWriteStream, mkdirSync } from 'fs';
import * as path from 'path';


@Injectable()
export class AppService {

  domain = ''; // 域名
  rootDir = path.join(__dirname, '..'); // 项目根目录
  uploadDir = 'upload'; // 上传文件夹名称

  getHello(): string {
    return 'Hello World!';
  }


  // 创建上传目录
  createUploadDir(dirName) {
    let dir = path.join(this.rootDir, this.uploadDir, dirName);
    const dirArr = dir.split(path.sep);
    for (let i = 0; i < dirArr.length; i++) {
      if (!dirArr[0]) {
        dirArr[0] = path.sep;
      }
      if (i > 0) {
        dirArr[i] = path.join(dirArr[i - 1], dirArr[i]);
      }
      if (dirArr[i] && !fs.existsSync(dirArr[i])) {
        console.log('need mkdir:' + dirArr[i]);
        fs.mkdirSync(dirArr[i]);
      }
    }
  }

  // 上传文件
  uploadFile(dirName, file, newFileName) {
    let targetFile = path.join(this.rootDir, this.uploadDir, dirName, newFileName);
    const writeImage = createWriteStream(targetFile);
    writeImage.write(file.buffer);
    return true;
  }


  // 写入app信息
  saveAppInfos(dirName, name, packageName, icon, version, newFileName, link, type, packageLink?) {
    let info = {
      name: name,
      icon: icon,
      version: version,
      link: link,
    };

    let jsonFile = path.join(this.rootDir, this.uploadDir, dirName, 'info.json');

    let str = JSON.stringify(info);
    fs.writeFile(jsonFile, str, function(err) {
      if (err) {
        console.error(err);
      }
    });

    if (type == 'ipa') {
      let plistFile = path.join(this.rootDir, this.uploadDir, dirName, newFileName.replace('.ipa', '.plist'));
      let templateFile = path.join(this.rootDir, 'public', 'ios_template.plist');
      let plistString = fs.readFileSync(templateFile).toString();
      plistString = plistString.replace('{{ipaPath}}', packageLink);
      plistString = plistString.replace('{{identifier}}', packageName);
      plistString = plistString.replace(/{{appName}}/g, name);
      fs.writeFile(plistFile, plistString, function(err) {
        if (err) {
          console.error(err);
        }
      });
    }
  }


  // 读取app列表
  getAppList() {
    let dir = path.join(this.rootDir, this.uploadDir);
    if (!fs.existsSync(dir)) {
      console.log('上传文件夹不存在');
      return [];
    }

    let childFileList = fs.readdirSync(dir);
    let apps = childFileList.map(item => {
      let file = path.join(dir, item);
      let appInfo = {};
      if (fs.lstatSync(file).isDirectory()) {
        appInfo = this.getAppInfo(item);
      } else {
        console.log("非文件夹文件");
      }
      return appInfo;
    });
    return apps;
  }

  // 读取指定文件夹的app信息
  getAppInfo(dir) {
    let jsonFile = path.join(this.rootDir, this.uploadDir, dir, 'info.json');
    if (fs.existsSync(jsonFile)) {
      let data = fs.readFileSync(jsonFile);
      return JSON.parse(data.toString());
    }
    return {};
  }

  // 读取app版本列表
  getVersionList(dir, isiOS, host) {
    let appDir = path.join(this.rootDir, this.uploadDir, dir);

    console.log(appDir)
    if (!fs.existsSync(appDir)) {
      return [];
    }

    let childFileList = fs.readdirSync(appDir);
    let items = childFileList.map(fileName => {
      let link = `${this.uploadDir}/${dir}/${fileName}`;
      if (isiOS) {
        link = `itms-services://?action=download-manifest&url=https://${host}/${this.uploadDir}/${dir}/${fileName}`;
      }

      return {
        file: fileName,
        version: 'v' + fileName.replace(/\.(apk|plist)/, '').replace(/.+_/, ''),
        link: link,
      };
    });
    if (isiOS) {
      items = items.filter(item => {
        return item.file.indexOf('.plist') > 0;
      });
    } else {
      items = items.filter(item => {
        return item.file.indexOf('.apk') > 0;
      });
    }

    items.sort((a, b) => {
      return a.version > b.version ? -1 : 1;
    });

    return items;
  }

}




