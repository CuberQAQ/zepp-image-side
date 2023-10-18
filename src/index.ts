import * as fs from "@cuberqaq/fs-side";
// import pngjs from "pngjs/browser";
// import jpeg from "jpeg-js";
import * as _Jimp from "jimp";

// @ts-ignore
const Jimp = typeof self !== "undefined" ? self.Jimp || _Jimp : _Jimp;
export function _parseHmPath(path: string) {
  path = path.trim();
  let isAssets: boolean;
  if (path.startsWith("assets://")) {
    path = path.substring("assets://".length);
    isAssets = true;
  } else if (path.startsWith("data://")) {
    path = path.substring("data://".length);
    isAssets = false;
  } else throw new Error("[@cuberqaq/transfer-file] Unexpected arg fileName");
  return {
    path,
    isAssets,
  };
}

namespace cuberx {
  interface ResultOption {
    /**
     * Converted file size in bytes. 转换后的文件大小，单位字节
     */
    size: number;
  }
  interface Result {
    /**
     * Original Image Path. 原图片路径
     */
    filePath: string;
    /**
     * 	Converted Image Path. 转换后的图片路径
     */
    targetFilePath: string;
    /**
     * Image Conversion Information. 图片转换信息
     */
    options: ResultOption;
  }
  /**
   * The "Device App" can not show png images due to the limitation of device. The image can be shown normally after converting by image module.
   * 由于设备性能受限，「设备应用」不支持直接展示 png 格式的图片，从网络下载的 png 图片需要经过 image 模块转换后，才可以在「设备应用」上正常展示。
   */
  export class Image {
    /**
     * Converting png images to image formats supported by the "Device App". 将 png 图片转化为「设备应用」支持的图片格式
     * @param options
     */
    async convert(options: {
      /**
       * Path to the image that needs to be converted.
       * 需要转换格式的图片路径
       */
      filePath: string;
      /**
       * If not filled, the rule for the path of the converted image is ${filePath}_converted. For example given the filePath value data://1.png, the converted path is data://1.png_converted
       * 如果不填写，转换后图片路径的规则为 ${filePath}_converted。例如给定 filePath 值 data://1.png，则转换后的路径为 data://1.png_converted
       */
      targetFilePath?: string;
    }): Promise<Result> {
      try {
        let rawParsed = _parseHmPath(options.filePath);
        let convertedParsed = _parseHmPath(
          options.targetFilePath ?? options.filePath + "_converted"
        );

        let rawFileHandle: number, rawFileSize: number;
        if (rawParsed.isAssets) {
          rawFileHandle = fs.openAssetsSync({
            path: rawParsed.path,
          });
          rawFileSize = fs.statAssetsSync({ path: rawParsed.path })?.size ?? 0;
        } else {
          rawFileHandle = fs.openSync({
            path: rawParsed.path,
          });
          rawFileSize = fs.statSync({ path: rawParsed.path })?.size ?? 0;
        }
        let convertedFileHandle: number, convertedFileSize;
        if (convertedParsed.isAssets)
          convertedFileHandle = fs.openAssetsSync({
            path: convertedParsed.path,
            flag: fs.O_WRONLY | fs.O_CREAT,
          });
        else
          convertedFileHandle = fs.openSync({
            path: convertedParsed.path,
            flag: fs.O_WRONLY | fs.O_CREAT,
          });

        let rawBuf = new ArrayBuffer(rawFileSize);
        fs.readSync({ fd: rawFileHandle, buffer: rawBuf });
        // console.warn("jpeg decode:",jpeg.decode(rawBuf).data)
        let jimp = await Jimp.read(Buffer.from(rawBuf))
        jimp.rotate(90)
        jimp.getBuffer(
          Jimp.MIME_PNG,
          (error: any, buffer: Uint8Array) => {
            if (error) console.error("Jimp Error:", error);
            console.warn("JIMP start:", "options:",options,"rawFileHandle:",rawFileHandle,"convertedFileHandle",convertedFileHandle,"raw stat:",rawParsed.isAssets?fs.statAssetsSync({path:rawParsed.path}):fs.statSync({path:rawParsed.path}))
            console.warn("JIMP result:", buffer);
            convertedFileSize = buffer.byteLength;
            fs.writeSync({ fd: convertedFileHandle, buffer: buffer.buffer });
            console.warn("Result SAVE!!", buffer);
          }
        );
        console.warn("After awa");

        return {
          filePath: options.filePath,
          targetFilePath: options.targetFilePath ?? options.filePath,
          options: {
            size: convertedFileSize ?? 0,
          },
        };
      } catch (e) {
        console.error("[@cuberqaq/image-side]", "Catch Error:", e);
        throw e;
      }
    }
  }
}

export const image = new cuberx.Image();
