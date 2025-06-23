import RandomPlayer from '../components/RandomPlayer';

export default function Home() {
  return (
    <div className="p-4 flex flex-col gap-4 items-center">
      <h1 className="text-2xl font-bold">🎧 Telegram Audio</h1>
      <RandomPlayer />
    </div>
  );
}
