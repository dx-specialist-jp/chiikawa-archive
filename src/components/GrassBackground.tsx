export default function GrassBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none" aria-hidden="true">
      {/* Photo layer */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/images/bg-meadow.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center 62%",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Gradient overlay: cream at top for readability, fades to reveal photo */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #F5F2EC 0%, #F5F2EC 28%, rgba(245,242,236,0.95) 40%, rgba(245,242,236,0.65) 56%, rgba(245,242,236,0.18) 75%, rgba(245,242,236,0) 88%)",
        }}
      />
    </div>
  );
}
