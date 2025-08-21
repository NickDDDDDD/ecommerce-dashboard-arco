// src/lib/dayjs.ts
import dayjs from "dayjs";

// 插件
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// 语言（中文）
import "dayjs/locale/zh-cn";

// 装插件
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

// 设置语言
dayjs.locale("zh-cn");

export default dayjs;
