import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import * as Icons from "../Icons";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [newTopic, setNewTopic] = useState("");
  const [isAddModalOpen, setIsModalOpen] = useState(false);
  const [dropDown1, setDropDown1] = useState(true);
  const [dropDown2, setDropDown2] = useState(true);
  const [isActionModalOpen, setIsActionModalOpen] = useState({
    taskId: "",
    isOpen: false,
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState({
    isOpen: false,
    tasksId: "",
    text: "",
    topic: "",
  });
  const currentDate = new Date().toLocaleString("default", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  async function getTasks() {
    console.log(user);
    const result = await fetch("http://localhost:3000/api/tasks/all", {
      headers: {
        Authorization: "Bearer " + user?.accessToken,
        "Content-type": "application/json",
        Accept: "application/json",
      },
      method: "GET",
    });
    const data = await result.json();
    if (result.ok) {
      console.log(data);
      setTasks(data);
    }
  }

  useEffect(() => {
    if (user) {
      getTasks();
    }
  }, [user]);

  useEffect(() => {
    const userSaved = JSON.parse(localStorage.getItem("user"));
    if (!userSaved) {
      return navigate("/login");
    }
    setUser(userSaved);
  }, []);

  async function handleOnDrop(event, status) {
    setIsActionModalOpen({ taskId: "", isOpen: false });
    const id = event.dataTransfer.getData("text");
    const result = await fetch("http://localhost:3000/api/tasks/edit/status", {
      headers: {
        Authorization: "Bearer " + user?.accessToken,
        "Content-type": "application/json",
        Accept: "application/json",
      },
      method: "PUT",
      body: JSON.stringify({ task_id: id, status }),
    });

    if (result.ok) {
      setTasks((prev) => {
        return prev.map((task) => {
          if (task.id == id) {
            task.status = status;
          }
          return task;
        });
      });
    }
  }

  async function deleteTask(taskId) {
    const result = await fetch("http://localhost:3000/api/tasks/delete", {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + user?.accessToken,
        "Content-type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ task_id: taskId }),
    });
    if (result.ok) {
      await getTasks();
    }
  }

  async function addNewTask() {
    if (!newTask) {
      return;
    }

    const result = await fetch("http://localhost:3000/api/tasks/new", {
      method: "Post",
      headers: {
        Authorization: "Bearer " + user?.accessToken,
        "Content-type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ task: newTask, topic: newTopic }),
    });
    if (result.ok) {
      await getTasks();
      setIsModalOpen(false);
      setNewTask("");
      setNewTopic("");
    }
  }

  async function editTask(taskId) {
    if (!isEditModalOpen.text || !isEditModalOpen.topic) {
      return;
    }

    const result = await fetch("http://localhost:3000/api/tasks/edit/text", {
      method: "PUT",
      headers: {
        Authorization: "Bearer " + user?.accessToken,
        "Content-type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        task_id: taskId,
        topic: isEditModalOpen.topic,
        text: isEditModalOpen.text,
      }),
    });
    if (result.ok) {
      await getTasks();
      setIsEditModalOpen({
        isOpen: false,
        taskId: "",
        text: "",
        topic: "",
      });
    }
  }

  async function logout() {
    localStorage.removeItem("user");
    return navigate("/login");
  }

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <div className="nav-sidebar">
        <div className="top">
          <img src={Icons.ovalsIcon} alt="" />
          <img src={Icons.logoIcon} alt="" />
          <div>
            <img src={Icons.squaresIcon} alt="" />
          </div>
          <img src={Icons.userIcon} alt="" />
          <img src={Icons.calendarIcon} alt="" />
          <img src={Icons.settingsIcon} alt="" />
        </div>
        <img onClick={logout} src={Icons.logoutIcon} alt="" />
      </div>

      <div className="projects-sidebar">
        <div className="header">
          <h3>Project A</h3>
          <img src={Icons.addIcon} alt="" />
        </div>
        <div className="dropdown-list">
          <div className="dropdown-container">
            <div className="header">
              <h4>Projects (3)</h4>
              <img
                onClick={() => setDropDown1((prev) => !prev)}
                src={Icons.arrowDownd}
                alt=""
              />
            </div>

            {dropDown1 && (
              <div className="dropdown">
                <div className="item item-active">
                  <div className="line"></div>
                  <span>Design system</span>
                </div>
                <div className="item">
                  <div className="line"></div>
                  <span>Design system</span>
                </div>
                <div className="item">
                  <div className="line"></div>
                  <span>Design system</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="dropdown-list">
          <div className="dropdown-container">
            <div className="header">
              <h4>Tasks ({tasks.length})</h4>
              <img
                onClick={() => setDropDown2((prev) => !prev)}
                src={Icons.arrowDownd}
                alt=""
              />
            </div>
            {dropDown2 && (
              <div className="dropdown">
                <div className="item item-active">
                  <div className="line"></div>
                  <span>
                    To do (
                    {tasks?.filter((task) => task.status == "todo").length})
                  </span>
                </div>
                <div className="item">
                  <div className="line"></div>
                  <span>
                    In progress (
                    {
                      tasks?.filter((task) => task.status == "in_progress")
                        .length
                    }
                    )
                  </span>
                </div>
                <div className="item">
                  <div className="line"></div>
                  <span>
                    Done (
                    {tasks?.filter((task) => task.status == "done").length})
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="kanban-container">
        <nav>
          <h2>
            Welcome back, <span>{user.name}</span>
          </h2>
          <div className="right">
            <img src={Icons.searchIcon} alt="" />
            <img src={Icons.calendarIcon} alt="" />
            <span>{currentDate}</span>
            <img
              className="avatar"
              style={{
                padding: user.avatar_url ? "0" : "5px",
              }}
              src={user.avatar_url || Icons.avatarIcon}
              alt=""
            />
          </div>
        </nav>
        <div className="board-tabs">
          <div className="tabs-container">
            <div className="tab active">
              <img src={Icons.boardIcon} alt="" />
              <span>Board view</span>
            </div>
            <div className="tab">
              <img src={Icons.addIcon} alt="" />
              <span>Add view</span>
            </div>
          </div>
          <div className="tab-line">
            <div></div>
          </div>
        </div>

        {isAddModalOpen && (
          <div className="add-modal">
            <div className="close-container">
              <img
                src={Icons.addIcon}
                onClick={() => setIsModalOpen(false)}
                alt=""
              />
            </div>

            <input
              value={newTask}
              onChange={(event) => setNewTask(event.target.value)}
              type="text"
              placeholder="Your task"
            />

            <input
              value={newTopic}
              onChange={(event) => setNewTopic(event.target.value)}
              type="text"
              placeholder="Topic"
            />

            <button onClick={addNewTask}>Add task</button>
          </div>
        )}

        {isEditModalOpen.isOpen && (
          <div className="add-modal">
            <div className="close-container">
              <img
                src={Icons.addIcon}
                onClick={() =>
                  setIsEditModalOpen({
                    isOpen: false,
                    tasksId: "",
                    text: "",
                    topic: "",
                  })
                }
                alt=""
              />
            </div>

            <input
              value={isEditModalOpen.text}
              onChange={(event) =>
                setIsEditModalOpen((prev) => ({
                  ...prev,
                  text: event.target.value,
                }))
              }
              type="text"
              placeholder="Your task"
            />

            <input
              value={isEditModalOpen.topic}
              onChange={(event) =>
                setIsEditModalOpen((prev) => ({
                  ...prev,
                  topic: event.target.value,
                }))
              }
              type="text"
              placeholder="Topic"
            />

            <button onClick={() => editTask(isEditModalOpen.tasksId)}>
              Edit task
            </button>
          </div>
        )}

        <div
          className="kanban"
          style={{
            filter: isAddModalOpen ? "opacity(10%) brightness(70%)" : "none",
          }}
        >
          <div className="column">
            <div className="column-header">
              <div className="left">
                <img src={Icons.starIcon} alt="" />
                <h3>
                  To do ({tasks?.filter((task) => task.status == "todo").length}
                  )
                </h3>
              </div>
              <div className="right">
                <img
                  onClick={() => setIsModalOpen(true)}
                  src={Icons.addIcon}
                  alt=""
                />
              </div>
            </div>
            <div
              className="column-tasks"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => handleOnDrop(event, "todo")}
            >
              {tasks
                ?.filter((task) => task.status == "todo")
                .map((task) => (
                  <div
                    key={task.id}
                    className="task-card"
                    draggable
                    onDragEnter={(event) => event.preventDefault()}
                    onDragOver={(event) => event.preventDefault()}
                    onDragStart={(event) =>
                      event.dataTransfer.setData("text", task.id)
                    }
                  >
                    <div className="top">
                      <div className="lef">
                        <span className="task-text">{task.text}</span>
                        <span className="topic-text">{task.topic}</span>
                      </div>
                      <div className="right">
                        <img
                          onClick={() =>
                            setIsActionModalOpen((prev) => ({
                              isOpen: !prev.isOpen,
                              taskId: task.id,
                            }))
                          }
                          src={Icons.moreIcon}
                          alt=""
                        />
                        {isActionModalOpen.isOpen &&
                        isActionModalOpen.taskId == task.id ? (
                          <div className="task-action">
                            <img
                              onClick={() =>
                                setIsEditModalOpen({
                                  isOpen: true,
                                  tasksId: task.id,
                                  text: task.text,
                                  topic: task.topic,
                                })
                              }
                              src={Icons.editIcon}
                              alt=""
                            />
                            <img
                              onClick={() => deleteTask(task.id)}
                              src={Icons.trashIcon}
                              alt=""
                            />
                          </div>
                        ) : (
                          ""
                        )}
                      </div>
                    </div>

                    <div className="progress-container">
                      <div className="progress-details">
                        <div className="left">
                          <img src={Icons.progressIcon} alt="" />
                          <span>Progress</span>
                        </div>
                        <div className="right">
                          <span>
                            {task.tasks_done_count}/{task.total_tasks_count}
                          </span>
                        </div>
                      </div>
                      <div className="progress-bar">
                        <div
                          style={{
                            width:
                              100 *
                                (task.tasks_done_count /
                                  task.total_tasks_count) +
                              "%",
                          }}
                          className="progress-in"
                        ></div>
                      </div>
                      <div className="date-status">
                        <div className="left">
                          <div className="date">
                            {new Date(
                              Number(task.created_at)
                            ).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="right">
                          <img src={Icons.starIcon} alt="" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="column">
            <div className="column-header">
              <div className="left">
                <img src={Icons.clockIcon} alt="" />
                <h3>
                  In progress (
                  {tasks?.filter((task) => task.status == "in_progress").length}
                  )
                </h3>
              </div>
            </div>
            <div
              className="column-tasks"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => handleOnDrop(event, "in_progress")}
            >
              {tasks
                ?.filter((task) => task.status == "in_progress")
                .map((task) => (
                  <div
                    key={task.id}
                    className="task-card"
                    draggable
                    onDragEnter={(event) => event.preventDefault()}
                    onDragOver={(event) => event.preventDefault()}
                    onDragStart={(event) =>
                      event.dataTransfer.setData("text", task.id)
                    }
                  >
                    <div className="top">
                      <div className="lef">
                        <span className="task-text">{task.text}</span>
                        <span className="topic-text">{task.topic}</span>
                      </div>
                      <div className="right">
                        <img
                          onClick={() =>
                            setIsActionModalOpen((prev) => ({
                              isOpen: !prev.isOpen,
                              taskId: task.id,
                            }))
                          }
                          src={Icons.moreIcon}
                          alt=""
                        />
                        {isActionModalOpen.isOpen &&
                        isActionModalOpen.taskId == task.id ? (
                          <div className="task-action">
                            <img
                              onClick={() =>
                                setIsEditModalOpen({
                                  isOpen: true,
                                  tasksId: task.id,
                                  text: task.text,
                                  topic: task.topic,
                                })
                              }
                              src={Icons.editIcon}
                              alt=""
                            />
                            <img
                              onClick={() => deleteTask(task.id)}
                              src={Icons.trashIcon}
                              alt=""
                            />
                          </div>
                        ) : (
                          ""
                        )}
                      </div>
                    </div>
                    <div className="progress-container">
                      <div className="progress-details">
                        <div className="left">
                          <img src={Icons.progressIcon} alt="" />
                          <span>Progress</span>
                        </div>
                        <div className="right">
                          <span>
                            {task.tasks_done_count}/{task.total_tasks_count}
                          </span>
                        </div>
                      </div>
                      <div className="progress-bar">
                        <div
                          style={{
                            width:
                              100 *
                                (task.tasks_done_count /
                                  task.total_tasks_count) +
                              "%",
                          }}
                          className="progress-in"
                        ></div>
                      </div>
                      <div className="date-status">
                        <div className="left">
                          <div className="date">
                            {new Date(
                              Number(task.created_at)
                            ).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="right">
                          <img src={Icons.clockIcon} alt="" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
          <div className="column">
            <div className="column-header">
              <div className="left">
                <img src={Icons.doneIcon} alt="" />
                <h3>
                  Done ({tasks?.filter((task) => task.status == "done").length})
                </h3>
              </div>
            </div>
            <div
              className="column-tasks"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => handleOnDrop(event, "done")}
            >
              {tasks
                ?.filter((task) => task.status == "done")
                .map((task) => (
                  <div
                    key={task.id}
                    className="task-card"
                    draggable
                    onDragEnter={(event) => event.preventDefault()}
                    onDragOver={(event) => event.preventDefault()}
                    onDragStart={(event) =>
                      event.dataTransfer.setData("text", task.id)
                    }
                  >
                    <div className="top">
                      <div className="lef">
                        <span className="task-text">{task.text}</span>
                        <span className="topic-text">{task.topic}</span>
                      </div>
                      <div className="right">
                        <img
                          onClick={() =>
                            setIsActionModalOpen((prev) => ({
                              isOpen: !prev.isOpen,
                              taskId: task.id,
                            }))
                          }
                          src={Icons.moreIcon}
                          alt=""
                        />
                        {isActionModalOpen.isOpen &&
                        isActionModalOpen.taskId == task.id ? (
                          <div className="task-action">
                            <img
                              onClick={() =>
                                setIsEditModalOpen({
                                  isOpen: true,
                                  tasksId: task.id,
                                  text: task.text,
                                  topic: task.topic,
                                })
                              }
                              src={Icons.editIcon}
                              alt=""
                            />
                            <img
                              onClick={() => deleteTask(task.id)}
                              src={Icons.trashIcon}
                              alt=""
                            />
                          </div>
                        ) : (
                          ""
                        )}
                      </div>
                    </div>
                    <div className="progress-container">
                      <div className="progress-details">
                        <div className="left">
                          <img src={Icons.progressIcon} alt="" />
                          <span>Progress</span>
                        </div>
                        <div className="right">
                          <span>
                            {task.tasks_done_count}/{task.total_tasks_count}
                          </span>
                        </div>
                      </div>
                      <div className="progress-bar">
                        <div
                          style={{
                            width:
                              100 *
                                (task.tasks_done_count /
                                  task.total_tasks_count) +
                              "%",
                          }}
                          className="progress-in"
                        ></div>
                      </div>
                      <div className="date-status">
                        <div className="left">
                          <div className="date">
                            {new Date(
                              Number(task.created_at)
                            ).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="right">
                          <img src={Icons.doneIcon} alt="" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
