import { assetPath } from "@/lib/site";

/**
 * 全ページ共通の背景。上部はクリーム色で塗りつぶして本文の可読性を保ち、
 * 下にいくほど草原の写真が透けて見えるようにしている。
 */
export default function GrassBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none" aria-hidden="true">
      <div
        className="absolute inset-0 bg-cover bg-no-repeat"
        style={{
          backgroundImage: `url('${assetPath("/images/bg-meadow.jpg")}')`,
          backgroundPosition: "center 62%",
        }}
      />
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
