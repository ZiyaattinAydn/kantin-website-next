type AmbientDoodle = {
  src: string;
  className: string;
};

const ambientDoodles: AmbientDoodle[] = [
  {
    src: "/assets/img/merch/doodles/table-friends.png",
    className: "ambient-doodle-table",
  },
  {
    src: "/assets/img/merch/doodles/looking-up.png",
    className: "ambient-doodle-look",
  },
  {
    src: "/assets/img/merch/doodles/bar-friends.png",
    className: "ambient-doodle-bar",
  },
  {
    src: "/assets/img/merch/doodles/jumping.png",
    className: "ambient-doodle-jump",
  },
  {
    src: "/assets/img/merch/doodles/cats-table.png",
    className: "ambient-doodle-cats",
  },
  {
    src: "/assets/img/merch/doodles/sharing-drink.png",
    className: "ambient-doodle-share",
  },
  {
    src: "/assets/img/merch/doodles/high-five.png",
    className: "ambient-doodle-highfive",
  },
  {
    src: "/assets/img/merch/doodles/hugging.png",
    className: "ambient-doodle-hug",
  },
  {
    src: "/assets/img/merch/doodles/walking.png",
    className: "ambient-doodle-walk",
  },
];

export default function AmbientDoodles() {
  return (
    <div aria-hidden="true" className="merch-doodle-stage ambient-doodle-stage">
      {ambientDoodles.map((doodle) => (
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
