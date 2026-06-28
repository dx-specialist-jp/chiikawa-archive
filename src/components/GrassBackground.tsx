export default function GrassBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none" aria-hidden="true">
      {/* Sky gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #C8CEE8 0%, #D2D2EC 14%, #DCDAEE 28%, #E5DFFE 40%, #ECEAEE 52%, #F0EBE6 65%, #EBE3DA 80%, #E4DCD2 100%)",
        }}
      />

      {/* Grass SVG — fixed at viewport bottom */}
      <svg
        viewBox="0 0 1440 260"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMax slice"
        className="absolute bottom-0 w-full"
        style={{ height: "38vh", minHeight: "180px", maxHeight: "290px" }}
      >
        {/* Back layer — tall, muted, distant */}
        <path
          fill="#A8B89A"
          fillOpacity="0.32"
          d="M0 260
             C0 175, 50 140, 100 155
             C150 170, 200 132, 250 148
             C300 164, 350 128, 400 144
             C450 160, 500 124, 550 140
             C600 156, 650 120, 700 136
             C750 152, 800 116, 850 132
             C900 148, 950 112, 1000 128
             C1050 144, 1100 108, 1150 124
             C1200 140, 1250 104, 1300 120
             C1350 136, 1400 100, 1440 115
             L1440 260 Z"
        />

        {/* Mid layer */}
        <path
          fill="#88A076"
          fillOpacity="0.50"
          d="M0 260
             C0 195, 45 162, 90 178
             C135 194, 180 158, 225 174
             C270 190, 315 154, 360 170
             C405 186, 450 150, 495 166
             C540 182, 585 146, 630 162
             C675 178, 720 142, 765 158
             C810 174, 855 138, 900 154
             C945 170, 990 134, 1035 150
             C1080 166, 1125 130, 1170 146
             C1215 162, 1260 126, 1305 142
             C1350 158, 1395 122, 1440 138
             L1440 260 Z"
        />

        {/* Front layer — closest, darkest */}
        <path
          fill="#6A8860"
          fillOpacity="0.74"
          d="M0 260
             C0 215, 40 182, 80 198
             C120 214, 160 178, 200 194
             C240 210, 280 174, 320 190
             C360 206, 400 170, 440 186
             C480 202, 520 166, 560 182
             C600 198, 640 162, 680 178
             C720 194, 760 158, 800 174
             C840 190, 880 154, 920 170
             C960 186, 1000 150, 1040 166
             C1080 182, 1120 146, 1160 162
             C1200 178, 1240 142, 1280 158
             C1320 174, 1360 138, 1400 154
             C1420 162, 1440 150, 1440 155
             L1440 260 Z"
        />

        {/* Individual tall grass blades */}
        <g fill="none" strokeLinecap="round">
          {/* cluster 1 */}
          <path d="M38 260 C39 232,43 205,38 178" stroke="#527042" strokeWidth="1.2" strokeOpacity="0.62"/>
          <path d="M42 260 C41 228,37 200,42 170" stroke="#527042" strokeWidth="1"   strokeOpacity="0.48"/>
          <path d="M35 260 C36 236,40 210,35 184" stroke="#527042" strokeWidth="1"   strokeOpacity="0.52"/>
          {/* cluster 2 */}
          <path d="M168 260 C170 230,175 202,168 172" stroke="#527042" strokeWidth="1.2" strokeOpacity="0.60"/>
          <path d="M172 260 C170 226,165 198,171 168" stroke="#527042" strokeWidth="1"   strokeOpacity="0.46"/>
          {/* cluster 3 */}
          <path d="M302 260 C304 228,309 200,302 170" stroke="#527042" strokeWidth="1.2" strokeOpacity="0.64"/>
          <path d="M306 260 C304 224,299 196,305 166" stroke="#527042" strokeWidth="1"   strokeOpacity="0.50"/>
          <path d="M298 260 C300 232,304 206,298 178" stroke="#527042" strokeWidth="1"   strokeOpacity="0.54"/>
          {/* cluster 4 */}
          <path d="M440 260 C442 230,448 202,440 172" stroke="#527042" strokeWidth="1.2" strokeOpacity="0.60"/>
          <path d="M444 260 C442 226,437 198,443 168" stroke="#527042" strokeWidth="1"   strokeOpacity="0.46"/>
          {/* cluster 5 */}
          <path d="M575 260 C577 228,583 200,575 170" stroke="#527042" strokeWidth="1.2" strokeOpacity="0.64"/>
          <path d="M579 260 C577 224,572 196,578 166" stroke="#527042" strokeWidth="1"   strokeOpacity="0.50"/>
          <path d="M572 260 C574 232,578 206,572 178" stroke="#527042" strokeWidth="1"   strokeOpacity="0.54"/>
          {/* cluster 6 */}
          <path d="M710 260 C712 228,718 200,710 170" stroke="#527042" strokeWidth="1.2" strokeOpacity="0.60"/>
          <path d="M714 260 C712 224,707 196,713 166" stroke="#527042" strokeWidth="1"   strokeOpacity="0.46"/>
          {/* cluster 7 */}
          <path d="M848 260 C850 226,856 198,848 168" stroke="#527042" strokeWidth="1.2" strokeOpacity="0.64"/>
          <path d="M852 260 C850 222,845 194,851 164" stroke="#527042" strokeWidth="1"   strokeOpacity="0.50"/>
          <path d="M845 260 C847 230,851 204,845 176" stroke="#527042" strokeWidth="1"   strokeOpacity="0.54"/>
          {/* cluster 8 */}
          <path d="M982 260 C984 228,990 200,982 170" stroke="#527042" strokeWidth="1.2" strokeOpacity="0.60"/>
          <path d="M986 260 C984 224,979 196,985 166" stroke="#527042" strokeWidth="1"   strokeOpacity="0.46"/>
          {/* cluster 9 */}
          <path d="M1118 260 C1120 226,1126 198,1118 168" stroke="#527042" strokeWidth="1.2" strokeOpacity="0.64"/>
          <path d="M1122 260 C1120 222,1115 194,1121 164" stroke="#527042" strokeWidth="1"   strokeOpacity="0.50"/>
          <path d="M1115 260 C1117 230,1121 204,1115 176" stroke="#527042" strokeWidth="1"   strokeOpacity="0.54"/>
          {/* cluster 10 */}
          <path d="M1255 260 C1257 228,1263 200,1255 170" stroke="#527042" strokeWidth="1.2" strokeOpacity="0.60"/>
          <path d="M1259 260 C1257 224,1252 196,1258 166" stroke="#527042" strokeWidth="1"   strokeOpacity="0.46"/>
          {/* cluster 11 */}
          <path d="M1390 260 C1392 230,1398 202,1390 172" stroke="#527042" strokeWidth="1.2" strokeOpacity="0.62"/>
          <path d="M1394 260 C1392 226,1387 198,1393 168" stroke="#527042" strokeWidth="1"   strokeOpacity="0.48"/>
        </g>

        {/* Wildflower dots at blade tips */}
        <g fillOpacity="0.55">
          <circle cx="38"   cy="176" r="2.4" fill="#D8CC98"/>
          <circle cx="42"   cy="168" r="1.8" fill="#D8CC98"/>
          <circle cx="35"   cy="182" r="1.6" fill="#D8CC98"/>
          <circle cx="168"  cy="170" r="2.4" fill="#D0C490"/>
          <circle cx="172"  cy="166" r="1.8" fill="#D0C490"/>
          <circle cx="302"  cy="168" r="2.4" fill="#D8CC98"/>
          <circle cx="306"  cy="164" r="1.8" fill="#D8CC98"/>
          <circle cx="298"  cy="176" r="1.6" fill="#D8CC98"/>
          <circle cx="440"  cy="170" r="2.4" fill="#D0C490"/>
          <circle cx="444"  cy="166" r="1.8" fill="#D0C490"/>
          <circle cx="575"  cy="168" r="2.4" fill="#D8CC98"/>
          <circle cx="579"  cy="164" r="1.8" fill="#D8CC98"/>
          <circle cx="572"  cy="176" r="1.6" fill="#D8CC98"/>
          <circle cx="710"  cy="168" r="2.4" fill="#D0C490"/>
          <circle cx="714"  cy="164" r="1.8" fill="#D0C490"/>
          <circle cx="848"  cy="166" r="2.4" fill="#D8CC98"/>
          <circle cx="852"  cy="162" r="1.8" fill="#D8CC98"/>
          <circle cx="845"  cy="174" r="1.6" fill="#D8CC98"/>
          <circle cx="982"  cy="168" r="2.4" fill="#D0C490"/>
          <circle cx="986"  cy="164" r="1.8" fill="#D0C490"/>
          <circle cx="1118" cy="166" r="2.4" fill="#D8CC98"/>
          <circle cx="1122" cy="162" r="1.8" fill="#D8CC98"/>
          <circle cx="1115" cy="174" r="1.6" fill="#D8CC98"/>
          <circle cx="1255" cy="168" r="2.4" fill="#D0C490"/>
          <circle cx="1259" cy="164" r="1.8" fill="#D0C490"/>
          <circle cx="1390" cy="170" r="2.4" fill="#D8CC98"/>
          <circle cx="1394" cy="166" r="1.8" fill="#D8CC98"/>
        </g>
      </svg>
    </div>
  );
}
