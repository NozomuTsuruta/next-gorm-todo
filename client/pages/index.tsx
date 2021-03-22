import { GetServerSideProps } from "next";
import { FormEvent, useState, useRef } from "react";

type ITodo = {
  ID: string;
  Text: string;
  Created: string;
};

export default function Index({ data }: { data: ITodo[] }) {
  const [todos, setTodos] = useState<ITodo[]>(data);
  const [editId, setEditId] = useState<string>();
  const ref = useRef<HTMLInputElement>(null);
  const editRef = useRef<HTMLInputElement>(null);

  const customFetch = async (path: string, body: Partial<ITodo>) => {
    try {
      const res = await fetch(`http://localhost:8080/${path}`, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setTodos(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (ref.current) {
      if (ref.current.value.trim().length === 0) {
        alert("1文字以上入力してください(スペースを除く)");
        return;
      }
      await customFetch("create", { Text: ref.current.value });
      ref.current.value = "";
    }
  };

  const handleUpdate = async (ID: string, Text: string) => {
    await customFetch("update", { ID, Text });
    setEditId(undefined);
  };

  const handleDelete = async (ID: string) => {
    if (confirm("本当に削除しますか？")) {
      customFetch("delete", { ID });
    }
  };

  return (
    <div className="m-[100px]">
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          ref={ref}
          placeholder="やることを追加"
          className="input"
        />
        <button
          type="submit"
          className="text-white bg-gray-500 rounded-md px-4 h-10"
        >
          追加
        </button>
      </form>
      <ul>
        {todos &&
          todos.map(({ ID, Text }) => (
            <li key={ID} className="border border-gray-500 rounded-md p-4 mb-4">
              {editId === ID ? (
                <>
                  <input
                    type="text"
                    className="input mb-2 block"
                    ref={editRef}
                    defaultValue={Text}
                  />
                  <button
                    onClick={() => setEditId(undefined)}
                    className="button mr-2"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={() => handleUpdate(ID, editRef.current!.value)}
                    className="button"
                  >
                    保存
                  </button>
                </>
              ) : (
                <>
                  <p className="font-bold h-10 mb-2">{Text}</p>
                  <button
                    onClick={() => handleDelete(ID)}
                    className="default-button mr-2"
                  >
                    削除
                  </button>
                  <button
                    onClick={() => setEditId(ID)}
                    className="default-button"
                  >
                    編集
                  </button>
                </>
              )}
            </li>
          ))}
      </ul>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const res = await fetch("http://localhost:8080/read", {
    method: "GET",
    mode: "cors",
  });
  const data = await res.json();
  return {
    props: { data },
  };
};
