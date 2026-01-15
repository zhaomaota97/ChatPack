'use client'

export function AdminRooms() {
  return (
    <div>
      <h2 className="text-base mb-4">💬 聊天室管理</h2>

      <div className="mb-4">
        <button
          onClick={() => alert('创建聊天室')}
          className="px-2.5 py-1 mx-0.5 cursor-pointer"
        >
          ➕ 创建聊天室
        </button>
      </div>

      <table className="w-full border-collapse">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 p-2">名称</th>
            <th className="border border-gray-300 p-2">关联单词书</th>
            <th className="border border-gray-300 p-2">描述</th>
            <th className="border border-gray-300 p-2">在线人数</th>
            <th className="border border-gray-300 p-2">状态</th>
            <th className="border border-gray-300 p-2">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-300 p-2">🌱 小学乐园</td>
            <td className="border border-gray-300 p-2">小学词汇</td>
            <td className="border border-gray-300 p-2">适合小学水平</td>
            <td className="border border-gray-300 p-2">45</td>
            <td className="border border-gray-300 p-2">
              <label>
                <input type="checkbox" defaultChecked className="mr-1" /> 启用
              </label>
            </td>
            <td className="border border-gray-300 p-2">
              <button
                onClick={() => alert('编辑')}
                className="px-2.5 py-1 mx-0.5 cursor-pointer"
              >
                编辑
              </button>
              <button
                onClick={() => alert('配置单词书')}
                className="px-2.5 py-1 mx-0.5 cursor-pointer"
              >
                配置单词书
              </button>
              <button
                onClick={() => alert('删除')}
                className="px-2.5 py-1 mx-0.5 cursor-pointer"
              >
                删除
              </button>
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 p-2">🌿 初中世界</td>
            <td className="border border-gray-300 p-2">小学+初中</td>
            <td className="border border-gray-300 p-2">初中水平交流</td>
            <td className="border border-gray-300 p-2">38</td>
            <td className="border border-gray-300 p-2">
              <label>
                <input type="checkbox" defaultChecked className="mr-1" /> 启用
              </label>
            </td>
            <td className="border border-gray-300 p-2">
              <button
                onClick={() => alert('编辑')}
                className="px-2.5 py-1 mx-0.5 cursor-pointer"
              >
                编辑
              </button>
              <button
                onClick={() => alert('配置单词书')}
                className="px-2.5 py-1 mx-0.5 cursor-pointer"
              >
                配置单词书
              </button>
              <button
                onClick={() => alert('删除')}
                className="px-2.5 py-1 mx-0.5 cursor-pointer"
              >
                删除
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
