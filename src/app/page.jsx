import Sidebar from '../components/Sidebar';
import TodoApp from '../components/TodoApp';

export default function Page() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <TodoApp />
      </div>
    </div>
  );
}
