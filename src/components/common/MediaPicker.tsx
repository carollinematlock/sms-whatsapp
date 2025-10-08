interface MediaPickerProps {
  accept?: string;
  onPick: (file: File) => void;
  label?: string;
}

export default function MediaPicker({ accept, onPick, label = "Add media" }: MediaPickerProps) {
  return (
    <label className="inline-flex items-center gap-2 text-sm cursor-pointer text-indigo-600 hover:text-indigo-700">
      <span className="font-medium">{label}</span>
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            onPick(file);
            event.target.value = "";
          }
        }}
      />
    </label>
  );
}
