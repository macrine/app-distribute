import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { createWriteStream, mkdirSync } from 'fs';
import * as path from 'path';

// import {fs} from 'fs';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }


  // 创建上传目录
  createUploadDir(dir) {
    const dirArr = dir.split(path.sep);
    for (let i = 0; i < dirArr.length; i++) {
      if (i > 0) {
        dirArr[i] = path.join(dirArr[i - 1], dirArr[i]);
      }
      console.log(dirArr);
      console.log(dirArr[i]);
      if (dirArr[i] && !fs.existsSync(dirArr[i])) {
        fs.mkdirSync(dirArr[i]);
      }
    }
  }

  // 上传文件
  uploadFile(dir, file, newFileName) {
    const writeImage =
      createWriteStream(path.join(dir, newFileName));
    writeImage.write(file.buffer);
    return true;
  }


  // 写入app信息
  saveAppInfos(dir, name, packageName, icon, version, newFileName, link, type, packageLink?) {
    let info = {
      name: name,
      icon: icon,
      version: version,
      link: link,
    };


    let jsonFile = path.join(dir, 'info.json');

    let str = JSON.stringify(info);
    fs.writeFile(jsonFile, str, function(err) {
      if (err) {
        console.error(err);
      }
    });

    if (type == 'ipa') {
      let plistFile = path.join(dir, newFileName.replace('ipa', 'plist'));
      let templateFile = path.join(__dirname, '..', 'public', 'ios_template.plist');
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


  // 读取app信息
  getAppInfo(dir) {
    let jsonFile = path.join(dir, 'info.json');
    if (fs.existsSync(jsonFile)) {
      let data = fs.readFileSync(jsonFile);
      return JSON.parse(data.toString());
    }
    return {};
  }

  // 读取app列表
  getAppList(dir) {
    if (!fs.existsSync(dir)) {
      return [];
    }

    let list = fs.readdirSync(dir);
    let tmp = list.map(item => {
      let file = path.join(dir, item);
      let appInfo = {};
      if (fs.lstatSync(file).isDirectory()) {
        appInfo = this.getAppInfo(path.join(dir, item));
      } else {
        console.log(fs.readFileSync(file));
      }
      return appInfo;
    });
    return tmp;
  }

  // 读取app版本列表
  getVersionList(dir, isiOS, viewLink) {
    if (!fs.existsSync(dir)) {
      return {};
    }


    let list = fs.readdirSync(dir);
    let tmp = list.map(item => {
      let file = path.join(dir, item);
      if (fs.lstatSync(file).isDirectory()) {

      } else {
        // console.log(fs.readFileSync(file));
      }

      let link = dir + '/' + item;
      if(isiOS) {
        link = 'itms-services://?action=download-manifest&url=https://' +viewLink+ link;
      }

      return {
        file: item,
        version: 'v' + item.replace(/\.(apk|plist)/, '').replace(/.+_/, ''),
        link: link,
      };
    });
    if (isiOS) {
      tmp = tmp.filter(item => {
        return item.file.indexOf('.plist') > 0;
      });
    } else {
      tmp = tmp.filter(item => {
        return item.file.indexOf('.apk') > 0;
      });
    }

    tmp.sort((a, b) => {
      return a.version > b.version ? -1 : 1;
    });

    return tmp;
  }

}




