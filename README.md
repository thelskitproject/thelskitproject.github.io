This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 教室二维码导入

使用 Node.js 22.18+（需要原生 TypeScript 支持），在项目根目录执行：

```bash
pnpm import:qr /absolute/path/to/qr.png --building-name "Building Name" --room-number "Room Number" --room-name "Room Name"
pnpm test:qr
```

macOS 上通过系统 sips 解码 HEIC/HEIF；其他图片支持 PNG、JPEG 等 Sharp 支持的格式，请使用只包含一个二维码的清晰图片。
记录写入 `data/checkin-codes.json`；房间号按字符串保存，以保留前导零。Room Name 必填，照抄照片上的原文，不含房间号，不要缩写或翻译；已有 null 记录仍可读取。命名参数顺序不限，重复或未知参数会报错。
相同教学楼和房间号不会自动覆盖。更新已有记录前请先核实数据。

网页 `/en/code` 或 `/zh/code` 从数据仓库的 `checkin-codes.min.json` 读取最新记录，并用 Canvas 解包 Base64 二进制模块矩阵后绘制二维码，不重新编码数据。
每条记录仅包含 `buildingName`、`roomNumber`、`roomName` 和 `matrix`。
`matrix` 为行优先、每字节最高位优先打包的 Base64，末尾补零；矩阵边长从解码后的字节数推导。
不重复保存二维码版本、文本、原始字节或编码分段：这些信息已包含在二维码模块中。
矩阵保留识别到的黑白模块，包括原来的掩码、纠错和格式信息；浏览器添加四模块白色静区。
导入时使用临时解码结果核对还原后的内容、编码分段和图案，通过后仅写入四个必要字段。
遇到 jsQR 无法定位的倾斜二维码，会使用本地 ZXing-C++ WASM 进行透视采样，并用 jsQR 独立核对还原数据。WASM 从安装的依赖读取，不需要联网。
模糊或有遮挡的图片仍可能被错误采样，即使纠错后可解码也不能保证损坏前的图案；请提供清晰完整图片，并核对还原结果。图片及其中的数据不会被上传到外部服务。

当前已收录 Clothworkers North Building / G.06 / Edit 1。导入记录需要在数据仓库审核合并；合并后网站会读取更新，无需重新部署。


## 浏览器照片解析

求码页的“新增教室二维码”入口（`/en/code/new` 或 `/zh/code/new`）在浏览器中本地处理 PNG、JPEG、WebP（最大 20 MB、2000 万像素）。
从照片提取原有二维码模块，显示 Canvas 还原预览，不返回或展示二维码内容数据。
`lib/parse-qr-photo.ts` 提供 `parseQRCodePhoto(file)` 接口，仅返回 `{ matrix }`，其中 matrix 为按位打包的 Base64 模块矩阵。
WASM 来自固定版本的本地依赖，`pnpm dev` / `pnpm build` 会自动复制到静态资源目录；照片不会上传到服务端。

新增页支持选择或手动输入 Building Name，并单独填写 Room Name、Room Number；刷新页面会清除未提交的信息。

## 独立数据仓库

`./data` 是 [lskit-data](https://github.com/thelskitproject/lskit-data) 的独立 Git 克隆，父仓库忽略整个目录。真实数据、导入工具、Issue 模板和机器人工作流在这个子仓库中分别提交。网站在浏览器中直接读取数据仓库 main 分支的 `checkin-codes.min.json`，本地克隆仅供数据维护和导入工具使用。

首次检出网站后执行：

```sh
git clone https://github.com/thelskitproject/lskit-data.git data
pnpm dev
```

使用 `pnpm sync:data`（`git -C data pull --ff-only`）更新数据；该命令需要数据仓库先有默认分支及初始提交。网站构建不再需要检出数据仓库。

网站新增页点击“提交教室记录”后，跳转到数据仓库，自动填写 Issue 标题和教室记录，用户登录后确认创建，由机器人创建数据 PR，维护者审核合并。页面打开、返回前台和每隔 60 秒会重新读取数据（后台暂停轮询）。请求失败会保留已加载的数据，并提供重试；GitHub 的缓存可能导致更新稍有延迟。无需配置跨仓库部署 Token。

数据仓库命令：`git -C data status`、`git -C data add .`、`git -C data commit`、`git -C data push`。照片留在浏览器，Issue 中的教室信息和矩阵公开。

## 本地化

使用 Lingui，英文为源语言，中文为翻译语言。访问 `/` 时按浏览器首选语言导航到 `/zh/` 或 `/en/`，不支持的语言使用英文；页面内导航保留语言，右上角可切换。旧的 `/code` 和 `/code/new` 入口保留自动导航。GitHub Pages 导出每种语言的独立 HTML，不依赖服务端重定向。

翻译文件：`locales/en/messages.po` 和 `locales/zh/messages.po`。界面使用 `useLingui()` 的 `i18n._("English source text")`；供浏览器显示的共享校验错误用 `/*i18n*/` 标记，保持 Node.js 导入工具独立于 React。

```sh
pnpm i18n:extract
# 编辑 locales/zh/messages.po
pnpm i18n:compile
```

`pnpm dev`、`pnpm build` 会先编译翻译；Pages 工作流也在 Next.js 构建前执行 `lingui compile`。`messages.ts` 是生成文件，不手动编辑。
