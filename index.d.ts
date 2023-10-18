declare namespace cuberx {
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
    convert(options: {
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
    }): Promise<Result>;
  }
}

export var image: cuberx.Image;
