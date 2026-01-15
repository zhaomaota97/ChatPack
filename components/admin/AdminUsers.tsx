'use client'

export function AdminUsers() {
  return (
    <div>
      <h2 className="text-base mb-4">👥 用户管理</h2>

      <div className="mb-4 p-2.5 border border-gray-300">
        <input
          type="text"
          placeholder="搜索用户名或昵称..."
          className="w-[200px] px-2 py-1"
        />
        <select className="px-2 py-1 ml-2.5">
          <option value="">全部角色</option>
          <option>USER</option>
          <option>ADMIN</option>
        </select>
        <select className="px-2 py-1 ml-2.5">
          <option value="">全部状态</option>
          <option>正常</option>
          <option>封禁</option>
        </select>
        <button className="px-2.5 py-1 mx-0.5 cursor-pointer ml-2.5">搜索</button>
      </div>

      <table className="w-full border-collapse mt-4">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 p-2">用户名</th>
            <th className="border border-gray-300 p-2">昵称</th>
            <th className="border border-gray-300 p-2">角色</th>
            <th className="border border-gray-300 p-2">状态</th>
            <th className="border border-gray-300 p-2">注册时间</th>
            <th className="border border-gray-300 p-2">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-300 p-2">traveler001</td>
            <td className="border border-gray-300 p-2">旅行者</td>
            <td className="border border-gray-300 p-2">
              <span className="inline-block px-2 py-0.5 text-xs rounded bg-green-600 text-white">
                USER
              </span>
            </td>
            <td className="border border-gray-300 p-2">正常</td>
            <td className="border border-gray-300 p-2">2026-01-01</td>
            <td className="border border-gray-300 p-2">
              <button
                onClick={() => alert('查看详情')}
                className="px-2.5 py-1 mx-0.5 cursor-pointer"
              >
                详情
              </button>
              <button
                onClick={() => alert('赠送卡包')}
                className="px-2.5 py-1 mx-0.5 cursor-pointer"
              >
                赠送
              </button>
              <button
                onClick={() => alert('封禁')}
                className="px-2.5 py-1 mx-0.5 cursor-pointer"
              >
                封禁
              </button>
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 p-2">admin</td>
            <td className="border border-gray-300 p-2">管理员</td>
            <td className="border border-gray-300 p-2">
              <span className="inline-block px-2 py-0.5 text-xs rounded bg-red-600 text-white">
                ADMIN
              </span>
            </td>
            <td className="border border-gray-300 p-2">正常</td>
            <td className="border border-gray-300 p-2">2025-12-01</td>
            <td className="border border-gray-300 p-2">
              <button
                onClick={() => alert('查看详情')}
                className="px-2.5 py-1 mx-0.5 cursor-pointer"
              >
                详情
              </button>
              <button disabled className="px-2.5 py-1 mx-0.5 cursor-not-allowed opacity-50">
                赠送
              </button>
              <button disabled className="px-2.5 py-1 mx-0.5 cursor-not-allowed opacity-50">
                封禁
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <p className="mt-4">
        显示 1-2 / 总共 1234 条
        <button className="px-2.5 py-1 mx-0.5 cursor-pointer ml-2">上一页</button>
        <button className="px-2.5 py-1 mx-0.5 cursor-pointer">下一页</button>
      </p>
    </div>
  )
}
