import TrackUploader from '../components/TrackUploader';

export default function AddTrack() {
  return (
    <div className="flex flex-col items-center p-4">
      <h2 className="text-xl font-bold mb-4">Загрузить трек</h2>
      <TrackUploader />
    </div>
  );
}