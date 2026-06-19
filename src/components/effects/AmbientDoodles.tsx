type AmbientDoodle = {
  id: string;
  src: string;
  className: string;
};

type AmbientDoodlePreset = "all" | "events";

const ambientDoodles: AmbientDoodle[] = [
  {
    id: "table",
    src: "/assets/img/merch/doodles/table-friends.png",
    className: "ambient-doodle-table",
  },
  {
    id: "look",
    src: "/assets/img/merch/doodles/looking-up.png",
    className: "ambient-doodle-look",
  },
  {
    id: "bar",
    src: "/assets/img/merch/doodles/bar-friends.png",
    className: "ambient-doodle-bar",
  },
  {
    id: "jump",
    src: "/assets/img/merch/doodles/jumping.png",
    className: "ambient-doodle-jump",
  },
  {
    id: "cats",
    src: "/assets/img/merch/doodles/cats-table.png",
    className: "ambient-doodle-cats",
  },
  {
    id: "share",
    src: "/assets/img/merch/doodles/sharing-drink.png",
    className: "ambient-doodle-share",
  },
  {
    id: "highfive",
    src: "/assets/img/merch/doodles/high-five.png",
    className: "ambient-doodle-highfive",
  },
  {
    id: "hug",
    src: "/assets/img/merch/doodles/hugging.png",
    className: "ambient-doodle-hug",
  },
  {
    id: "walk",
    src: "/assets/img/merch/doodles/walking.png",
    className: "ambient-doodle-walk",
  },
];

const presetIds: Record<AmbientDoodlePreset, readonly AmbientDoodle["id"][]> = {
  all: ambientDoodles.map((doodle) => doodle.id),
  events: ["jump", "share", "highfive", "walk"],
};

export default function AmbientDoodles({
  preset = "all",
  className = "",
}: {
  preset?: AmbientDoodlePreset;
  className?: string;
}) {
  const selectedIds = new Set(presetIds[preset]);
  const selectedDoodles = ambientDoodles.filter((doodle) =>
    selectedIds.has(doodle.id),
  );

  return (
    <div
      aria-hidden="true"
      className={`merch-doodle-stage ambient-doodle-stage${
        className ? ` ${className}` : ""
      }`}
    >
      {selectedDoodles.map((doodle) => (
        <img
          key={doodle.src}
          alt=""
          className={`merch-doodle ${doodle.className}`}
          src={doodle.src}
        />
      ))}
    </div>
  );
}
