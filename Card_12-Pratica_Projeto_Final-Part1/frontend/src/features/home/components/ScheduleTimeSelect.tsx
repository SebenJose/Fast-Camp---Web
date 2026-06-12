import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

const hourOptions = Array.from({ length: 24 }, (_, hour) =>
  hour.toString().padStart(2, "0"),
);

const minuteOptions = Array.from({ length: 12 }, (_, index) =>
  (index * 5).toString().padStart(2, "0"),
);

type ScheduleTimeSelectProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

function getTimeParts(value: string) {
  const [hour = "00", minute = "00"] = value.split(":");

  return {
    hour: hour.padStart(2, "0"),
    minute: minute.padStart(2, "0"),
  };
}

export function ScheduleTimeSelect({
  value,
  onChange,
  disabled = false,
}: ScheduleTimeSelectProps) {
  const { hour, minute } = getTimeParts(value);

  function handleHourChange(nextHour: string) {
    onChange(`${nextHour}:${minute}`);
  }

  function handleMinuteChange(nextMinute: string) {
    onChange(`${hour}:${nextMinute}`);
  }

  return (
    <div className="grid grid-cols-[1fr_1fr] gap-2">
      <Select value={hour} onValueChange={handleHourChange} disabled={disabled}>
        <SelectTrigger className="h-10 w-full rounded-xl border-app-border bg-input-opaque px-3 text-sm font-semibold text-primary-title hover:bg-card-opaque focus-visible:border-secundary-title/60 focus-visible:ring-secundary-title/20">
          <SelectValue aria-label={`${hour} horas`}>{hour}</SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-64 border-app-border bg-input-opaque text-primary-title shadow-xl shadow-black/30">
          {hourOptions.map((option) => (
            <SelectItem
              key={option}
              value={option}
              className="focus:bg-card-opaque focus:text-primary-title"
            >
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={minute}
        onValueChange={handleMinuteChange}
        disabled={disabled}
      >
        <SelectTrigger className="h-10 w-full rounded-xl border-app-border bg-input-opaque px-3 text-sm font-semibold text-primary-title hover:bg-card-opaque focus-visible:border-secundary-title/60 focus-visible:ring-secundary-title/20">
          <SelectValue aria-label={`${minute} minutos`}>{minute}</SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-64 border-app-border bg-input-opaque text-primary-title shadow-xl shadow-black/30">
          {minuteOptions.map((option) => (
            <SelectItem
              key={option}
              value={option}
              className="focus:bg-card-opaque focus:text-primary-title"
            >
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
