/*
import { useState } from "react";

codigo comentado pois no video foi removido para desenvolvimento do prototipo de tela
mas achei interessante deixar aqui para mostrar o uso do useState e fixar o exemplo

function App() {
  const [message, setMessage] = useState("Olá, mundo!");

  return (
    <div>
      <h1>{message}</h1>
      <button
        onClick={() => {
          setMessage("Olá, fui clicado!");
        }}
      >
        Mudar mensagem
      </button>
    </div>
  );
}

export default App;
*/

import Tasks from "./components/Tasks";
import AddTask from "./components/AddTask";
import { useEffect, useState } from "react";
import { v4 } from "uuid";
import Title from "./components/Title";

function App() {
  const [tasks, setTasks] = useState(
    JSON.parse(localStorage.getItem("tasks")) || [],
  );

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  // useEffect(() => {
  //   const fetchTasks = async () => {
  //     // CHAMAR A API
  //     try {
  //       const response = await fetch(
  //         "https://jsonplaceholder.typicode.com/todos?_limit=10",
  //         { method: "GET" },
  //       );

  //       // PEGAR OS DADOS QUE ELA RETORNA
  //       const data = await response.json();

  //       // ARMAZENAR/PERSISTIR ESSES DADOS NO STATE
  //       const formatted = data.map((t) => ({
  //         id: t.id,
  //         title: t.title,
  //         description: t.description || "",
  //         isCompleted: t.completed || false,
  //       }));

  //       setTasks(formatted);
  //     } catch (error) {
  //       console.error("Erro ao buscar tarefas:", error);
  //     }
  //   };

  //   fetchTasks();
  // }, []);

  function onTaskClick(taskId) {
    const newTasks = tasks.map((task) => {
      //PRECISO ATUALIZAR ESSA TAREFA
      if (task.id == taskId) {
        return { ...task, isCompleted: !task.isCompleted };
      }
      return task;
    });
    setTasks(newTasks);
  }

  function onDeleteTaskClick(taskId) {
    const newTasks = tasks.filter((task) => task.id !== taskId);
    setTasks(newTasks);
  }

  function onAddTaskSubmit(title, description) {
    const newTask = {
      id: v4(),
      title,
      description,
      isCompleted: false,
    };
    setTasks([...tasks, newTask]);
  }

  return (
    <div className="w-screen h-screen bg-slate-500 flex justify-center p-6">
      <div className="w-[500px] space-y-4">
        <Title>
          Gerenciador de Tarefas
        </Title>
        <AddTask onAddTaskSubmit={onAddTaskSubmit} />
        <Tasks
          tasks={tasks}
          onTaskClick={onTaskClick}
          onDeleteTaskClick={onDeleteTaskClick}
        />
      </div>
    </div>
  );
}

export default App;
