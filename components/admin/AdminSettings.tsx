'use client'

export function AdminSettings() {
  return (
    <div>
      <h2 className="text-base mb-4">⚙️ 系统设置</h2>

      <div className="mb-5 border border-gray-300 p-4">
        <h3 className="text-base mb-2">全局配置</h3>
        <p className="mb-2">
          <label>
            网站名称: <input type="text" defaultValue="ChatPack" className="px-2 py-1 ml-2" />
          </label>
        </p>
        <p className="mb-2">
          <label>
            网站描述:{' '}
            <input
              type="text"
              defaultValue="单词学习游戏平台"
              className="w-[400px] px-2 py-1 ml-2"
            />
          </label>
        </p>
        <p className="mb-2">
          <label>
            Logo URL:{' '}
            <input
              type="text"
              placeholder="https://..."
              className="w-[400px] px-2 py-1 ml-2"
            />
          </label>
        </p>
        <button className="px-2.5 py-1 mx-0.5 cursor-pointer">保存</button>
      </div>

      <div className="mb-5 border border-gray-300 p-4">
        <h3 className="text-base mb-2">功能开关</h3>
        <p className="mb-2">
          <label>
            <input type="checkbox" defaultChecked className="mr-2" />
            允许用户注册
          </label>
        </p>
        <p className="mb-2">
          <label>
            <input type="checkbox" defaultChecked className="mr-2" />
            邀请码必填
          </label>
        </p>
        <p className="mb-2">
          <label>
            <input type="checkbox" defaultChecked className="mr-2" />
            启用聊天室
          </label>
        </p>
        <p className="mb-2">
          <label>
            <input type="checkbox" defaultChecked className="mr-2" />
            启用开包功能
          </label>
        </p>
        <button className="px-2.5 py-1 mx-0.5 cursor-pointer">保存</button>
      </div>

      <div className="mb-5 border border-gray-300 p-4">
        <h3 className="text-base mb-2">系统参数</h3>
        <p className="mb-2">
          <label>
            新用户默认卡包数量:{' '}
            <input type="number" defaultValue="3" className="w-20 px-2 py-1 ml-2" />
          </label>
        </p>
        <p className="mb-2">
          <label>
            分页默认大小:{' '}
            <input type="number" defaultValue="20" className="w-20 px-2 py-1 ml-2" />
          </label>
        </p>
        <p className="mb-2">
          <label>
            最大上传文件大小(MB):{' '}
            <input type="number" defaultValue="10" className="w-20 px-2 py-1 ml-2" />
          </label>
        </p>
        <button className="px-2.5 py-1 mx-0.5 cursor-pointer">保存</button>
      </div>
    </div>
  )
}
