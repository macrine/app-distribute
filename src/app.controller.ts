import { Body, Controller, Get, Param, Post, Render, Req, UploadedFile, UseInterceptors, Request } from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadDto } from './upload.dto';
import { createWriteStream } from 'fs';
import * as path from 'path';


@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // 首页
  @Get()
  @Render('index')
  getHello(@Req() req: Request) {
    // console.log(req);
    // console.log(req);
    console.log(__dirname);
    console.log(__dirname);




    let apps = this.appService.getAppList('upload');

    return {
      title: '首页',
      apps: apps
    };
  }

  // headers:
  //   { host: 'localhost:3000',
  //     connection: 'keep-alive',
  //     'cache-control': 'max-age=0',
  //     'upgrade-insecure-requests': '1',
  //     'user-agent':
  //       'Mozilla/5.0 (Win


  // 显示
  @Get(':name')
  @Render('view')
  showView(@Param() params, @Req() req: Request) {
    let isiOS = req.headers['user-agent'].indexOf('iPhone')>-1;
    let dirName = params.name;
    // let viewLink = req.headers['host']+'/'; // 页面链接
    let viewLink = 'app.fuliwe.com/'; // 页面链接

    let appInfo = this.appService.getAppInfo(`upload/${dirName}`);
    let versionList = this.appService.getVersionList(`upload/${dirName}`, isiOS, viewLink);
    return {appInfo: appInfo, versionList: versionList}
  }

  // 上传
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(@UploadedFile() file, @Body() body: UploadDto, @Req() req) {
    // console.log(req);
    // console.log('body');
    // console.log(file);
    // console.log(file.originalname);
    // console.log(body);
    // console.log(body.package);
    // console.log(body.versionName);

    let icon = body.icon;

    let name = body.name;
    let arr = body.package.split('.');
    let dirName = arr[arr.length-1];
    // const dir = `upload/${dirName}`;
    const dir = path.join(__dirname, '..', 'upload', dirName);
    console.log(dir);


    let type = file.originalname.indexOf('.ipa')>0?'ipa':'apk';

    let newFileName = dirName+ '_'+ body.versionName +'.'+ type; //安装包文件名
    let viewLink = 'http://'+'app.fuliwe.com'+'/'+dirName; // 页面链接
    let packageLink = viewLink + '/' +newFileName; // 安装包链接

    console.log(3333333333);
    this.appService.createUploadDir(dir);
    console.log(44444444444);

    this.appService.saveAppInfos(dir, name, body.package, icon, body.versionName, newFileName, viewLink, type, packageLink);
    console.log(555555555);

    return this.appService.uploadFile(dir,file, newFileName);
  }
}
