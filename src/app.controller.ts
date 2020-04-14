import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Render,
  Req,
  UploadedFile,
  UseInterceptors,
  Request,
  HttpException, BadRequestException,
} from '@nestjs/common';
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
  getIndex(@Req() req: Request) {
    let apps = this.appService.getAppList();
    return {
      title: '首页',
      apps: apps
    };
  }


  // 显示
  @Get(':name')
  @Render('view')
  showView(@Param() params, @Req() req: Request) {
    let isiOS = req.headers['user-agent'].indexOf('iPhone')>-1;
    let dirName = params.name;
    let host = req.headers['host'];

    let appInfo = this.appService.getAppInfo(dirName);
    let versionList = this.appService.getVersionList(dirName, isiOS, host);
    return {appInfo: appInfo, versionList: versionList}
  }

  // 上传
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(@UploadedFile() file, @Body() body: UploadDto, @Req() req) {
    let icon = body.icon;
    let appName = body.name;
    let arr = body.package.split('.');
    let dirName = arr[arr.length-1];

    let host = req.headers['host'];
    let type = file.originalname.indexOf('.ipa')>0?'ipa':'apk';

    let newFileName = dirName+ '_'+ body.versionName +'.'+ type; //安装包文件名
    let viewLink = `http://${host}/${dirName}`; // 页面链接
    let packageLink = `http://${host}/${this.appService.uploadDir}/${dirName}/${newFileName}`; // 安装包链接

    // throw new BadRequestException('sss');
    this.appService.createUploadDir(dirName);
    this.appService.saveAppInfos(dirName, appName, body.package, icon, body.versionName, newFileName, viewLink, type, packageLink);
    return this.appService.uploadFile(dirName,file, newFileName);
  }
}
