export const TransitMapSVG = ({ isDarkMode }) => (
  <svg id="train-map" width="1368" height="1340" viewBox="0 0 1368 1340" version="1.1" className={`css-1qmhtch ${isDarkMode ? 'dark-map' : ''}`}><g id="metro" className="locale-en"><svg xmlns="http://www.w3.org/2000/svg" width="1362.22" height="1306.51" fill="none" viewBox="0 0 1362.22 1306.51">
    <defs>
      <style>{`
 #river path {
   opacity: 0.6;
   stroke: ${isDarkMode ? '#1e3a4a' : '#B8E5FA'};
 }
 
 text {
   font-family: inherit !important;
 }
 
 .dark-map text, .dark-map g[fill="#424143"], .dark-map path[fill="#424143"] {
   fill: #ffffff !important;
 }
 
 .dark-map circle[fill="#fff"], .dark-map path[fill="#fff"] {
   fill: #1a1c1e !important;
 }

 /* 3D Design for lines and stations */
 [data-name="train-line"] path {
   filter: drop-shadow(0px 1px 2px rgba(0,0,0,0.4)) drop-shadow(0px 1px 1px rgba(0,0,0,0.3));
 }
 [data-name="station"] circle {
   filter: drop-shadow(0px 1px 1px rgba(0,0,0,0.4));
 }


 :root {
   --future-color: transparent;
   --grey-line-color: transparent;
 }



 .locale-th [data-name="label-en"] {
   display: none;
 }

 .locale-th [data-name="label-th"] {
   display: block;
 }

 .locale-en [data-name="label-en"] {
   display: block;
 }

 .locale-en [data-name="label-th"] {
   display: none;
 }
`}</style>
    </defs>

    <g id="river">
      <path d="M236.472 107.66L236.472 408.366C236.472 410.476 237.306 412.5 238.791 413.999L461.182 638.321C462.667 639.819 463.501 641.843 463.501 643.953L463.5 900.66C463.5 905.078 467.082 908.66 471.5 908.66L549.525 908.66C551.742 908.66 553.859 909.579 555.372 911.199L640.025 1001.83C642.844 1004.85 642.902 1009.52 640.157 1012.61L601.985 1055.55C599.182 1058.71 599.309 1063.49 602.276 1066.49L685.652 1150.79C687.155 1152.3 689.203 1153.16 691.34 1153.16L723.135 1153.16C725.287 1153.16 727.349 1152.29 728.854 1150.75L815.341 1062.34C816.105 1061.56 816.702 1060.63 817.093 1059.61L833.891 1015.75C834.292 1014.7 834.911 1013.75 835.705 1012.95L878.498 970.162C881.561 967.099 886.506 967.03 889.653 970.007L979.851 1055.34C983.19 1058.5 983.187 1063.82 979.845 1066.97L916.813 1126.48C915.328 1127.88 913.363 1128.66 911.321 1128.66L804.863 1128.66C802.712 1128.66 800.652 1129.53 799.148 1131.06L779.786 1150.83C778.321 1152.32 777.5 1154.33 777.5 1156.43L777.5 1182.73C777.5 1185.48 778.921 1188.05 781.26 1189.51L799.555 1200.94C800.826 1201.74 802.295 1202.16 803.795 1202.16L911.773 1202.16C913.541 1202.16 915.26 1201.57 916.66 1200.49L975.841 1154.83C977.241 1153.75 978.96 1153.16 980.728 1153.16L986.5 1153.16C990.919 1153.16 994.5 1156.74 994.5 1161.16L994.5 1359.5" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round"></path>
    </g>
    <g id="station_RIVER" data-name="station" data-station-id="RIVER">
      <circle cx="463.5" cy="750" r="3.4" fill="#fff" stroke="#B8E5FA" strokeWidth="1.6" className="station-id-RIVER"></circle>
    </g>
    <g id="light-red-line" data-name="train-line">

      <g data-status="open">
        <g id="track">
          <path d="M278.5 704.76H321.39C322.133 704.761 322.868 704.616 323.554 704.333C324.241 704.05 324.865 703.634 325.39 703.11L450.03 578.46C450.556 577.936 451.18 577.52 451.866 577.237C452.552 576.954 453.288 576.809 454.03 576.81H577.13C578.624 576.815 580.056 577.411 581.112 578.468C582.169 579.524 582.765 580.956 582.77 582.45V611.5" stroke="#F26163" strokeWidth="4" strokeMiterlimit="10"></path>
        </g>


        <g id="station_RW05" data-name="station" data-station-id="RW05">
          <g id="label-en-12" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(301 687.62)" fontSize="6" fill="#424143">Bang Bamru</text> </g>
          <g id="label-th-12" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(309.5 687.62)" fontSize="6" fill="#424143">บางบำหรุ</text> </g>
          <g id="station-path-12" data-name="station-path">
            <circle cx="342.11" cy="686.29" r="3.4" fill="#fff" stroke="#F26163" strokeWidth="1.6" className="station-id-RW05"></circle>
          </g>
        </g>
        <g id="station_RW06" data-name="station" data-station-id="RW06">
          <g id="label-en-13" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(266.35 697.02)" fontSize="6" fill="#424143">Taling Chan</text> </g>
          <g id="label-th-13" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(271.5 697.02)" fontSize="6" fill="#424143">ตลิ่งชัน</text> </g>
          <g id="station-path-13" data-name="station-path">
            <circle cx="278.61" cy="704.96" r="3.4" fill="#fff" stroke="#F26163" strokeWidth="1.6" className="station-id-RW06"></circle>
          </g>
        </g>
      </g>
    </g>
    <g id="dark-red-line" data-name="train-line">


      <g data-status="open">
        <g id="track_2">
          <path d="M591 141L590.93 611" stroke="#C42329" strokeWidth="4" strokeMiterlimit="10"></path>
        </g>
        <g id="station_RN10" data-name="station" data-station-id="RN10">
          <g id="label-en-25" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(600 142.5)" fontSize="6" fill="#424143">Rangsit</text> </g>
          <g id="label-th-25" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(600 142.5)" fontSize="6" fill="#424143">รังสิต</text> </g>
          <g id="station-path-25" data-name="station-path">
            <circle cx="590.96" cy="140.39" r="3.4" fill="#fff" stroke="#C42329" strokeWidth="1.6" className="station-id-RN10"></circle>
          </g>
        </g>
        <g id="station_RN09" data-name="station" data-station-id="RN09">
          <g id="label-en-26" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(600 169.5)" fontSize="6" fill="#424143">Lak Hok</text> </g>
          <g id="label-th-26" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(600 169.5)" fontSize="6" fill="#424143">หลักหก</text> </g>
          <g id="station-path-26" data-name="station-path">
            <circle cx="590.96" cy="167.74" r="3.4" fill="#fff" stroke="#C42329" strokeWidth="1.6" className="station-id-RN09"></circle>
          </g>
        </g>
        <g id="station_RN08" data-name="station" data-station-id="RN08">
          <g id="label-en-27" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(551 206.5)" fontSize="6" fill="#424143">Don Muang</text> </g>
          <g id="label-th-27" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(559 206.5)" fontSize="6" fill="#424143">ดอนเมือง</text> </g>
          <g id="station-path-27" data-name="station-path">
            <circle cx="590.96" cy="204.9" r="3.4" fill="#fff" stroke="#C42329" strokeWidth="1.6" className="station-id-RN08"></circle>
          </g>
          <g id="donmuang-airport" data-name="airport" transform="translate(608.49 198.11)">
            <path fillRule="evenodd" clipRule="evenodd" d="M2.43668 15.4907C2.43814 14.9003 2.77359 14.3232 3.31998 13.6772L0.160311 11.6792C-0.0389073 11.5927 -0.0345127 11.4711 0.0812099 11.3276L0.750644 10.7563C0.872226 10.6816 1.00113 10.6494 1.14029 10.6875L5.03971 11.3466L8.28873 7.82808L0.703769 2.69673C0.511874 2.58394 0.495761 2.4565 0.693515 2.30855L1.78775 1.4355L11.6754 4.21431L14.5963 1.09126C15.5763 0.243116 16.5285 -0.136278 17.2594 0.0438976C17.6623 0.143507 17.8044 0.263624 17.9289 0.641554C18.1706 1.38276 17.7956 2.37886 16.9093 3.40425L13.7863 6.32515L16.5651 16.2128L15.6921 17.3071C15.5441 17.5034 15.4167 17.4873 15.3039 17.2968L10.1711 9.71333L6.6525 12.9609L7.31168 16.8603C7.34976 16.998 7.319 17.1269 7.24283 17.25L6.67154 17.9194C6.52945 18.0351 6.40641 18.0395 6.31998 17.8403L4.32193 14.6806C3.67301 15.2285 3.09586 15.5639 2.5026 15.5639C2.4484 15.5625 2.43668 15.5434 2.43668 15.4907Z" fill="#424143"></path>
          </g>
        </g>
        <g id="station_RN07" data-name="station" data-station-id="RN07">
          <g id="label-en-28" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(566 231.5)" fontSize="6" fill="#424143">Kheha</text> </g>
          <g id="label-th-28" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(562 231.5)" fontSize="6" fill="#424143">การเคหะ</text> </g>
          <g id="station-path-28" data-name="station-path">
            <circle cx="590.96" cy="229.7" r="3.4" fill="#fff" stroke="#C42329" strokeWidth="1.6" className="station-id-RN07"></circle>
          </g>
        </g>

        <g id="station_RN05" data-name="station" data-station-id="RN05">
          <g id="label-en-30" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(532 336.5)" fontSize="6" fill="#424143">Thung Song Hong</text> </g>
          <g id="label-th-30" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(554 336.5)" fontSize="6" fill="#424143">ทุ่งสองห้อง</text> </g>
          <g id="station-path-30" data-name="station-path">
            <circle cx="590.96" cy="334.9" r="3.4" fill="#fff" stroke="#C42329" strokeWidth="1.6" className="station-id-RN05"></circle>
          </g>
        </g>
        <g id="station_RN04" data-name="station" data-station-id="RN04">
          <g id="label-en-31" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(553 390.5)" fontSize="6" fill="#424143">Bang Khen</text> </g>
          <g id="label-th-31" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(564 390.5)" fontSize="6" fill="#424143">บางเขน</text> </g>
          <g id="station-path-31" data-name="station-path">
            <circle cx="590.96" cy="388.87" r="3.4" fill="#fff" stroke="#C42329" strokeWidth="1.6" className="station-id-RN04"></circle>
          </g>
        </g>
        <g id="station_RN03" data-name="station" data-station-id="RN03">
          <g id="label-en-32" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(535 462.5)" fontSize="6" fill="#424143">Wat Samean Nari</text> </g>
          <g id="label-th-32" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(550 462.5)" fontSize="6" fill="#424143">วัดเสมียนนารี</text> </g>
          <g id="station-path-32" data-name="station-path">
            <circle cx="590.96" cy="460.69" r="3.4" fill="#fff" stroke="#C42329" strokeWidth="1.6" className="station-id-RN03"></circle>
          </g>
        </g>
        <g id="station_RN02" data-name="station" data-station-id="RN02">
          <g id="label-en-33" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(553 556.5)" fontSize="6" fill="#424143">Chatuchak</text> </g>
          <g id="label-th-33" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(564.96 556.5)" fontSize="6" fill="#424143">จตุจักร</text> </g>
          <g id="station-path-33" data-name="station-path">
            <circle cx="590.96" cy="554.93" r="3.4" fill="#fff" stroke="#C42329" strokeWidth="1.6" className="station-id-RN02"></circle>
          </g>
        </g>

      </g>
    </g>


    <g id="pink-line" data-name="train-line">

      <g data-status="open">
        <g id="track-5" data-name="track">
          <g id="Line-10">
            <path d="M1285.61,488.22,1121.27,323.93a2.51,2.51,0,0,0-1.77-.73h-780a2.5,2.5,0,0,0-2.5,2.5v9.16a2.49,2.49,0,0,0,.73,1.77l68.42,68.42a2.51,2.51,0,0,1,.73,1.77q-.12,15-.25,30" transform="translate(-25.75 -52.38)" fill="none" stroke="#FFB2DD" strokeMiterlimit="10" strokeWidth="4"></path>
          </g>
        </g>

        <g id="station_PK02" data-name="station" data-station-id="PK02">
          <g id="label-en-110" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(390.26 349.94)" fontSize="6" fill="#424143">Khae Rai</text> </g>
          <g id="label-th-110" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(390.26 349.94)" fontSize="6" fill="#424143">แคราย</text> </g>
          <g id="station-path-110" data-name="station-path">
            <circle cx="380.22" cy="351.59" r="3.4" fill="#fff" stroke="#FFB2DD" strokeWidth="1.6" className="station-id-PK02"></circle>
          </g>
        </g>
        <g id="station_PK03" data-name="station" data-station-id="PK03">
          <g id="label-en-111" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(365.69 325.62)" fontSize="6" fill="#424143">Sanambin Nam</text> </g>
          <g id="label-th-111" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(365.69 325.62)" fontSize="6" fill="#424143">สนามบินน้ำ</text> </g>
          <g id="station-path-111" data-name="station-path">
            <circle cx="356.4" cy="328.56" r="3.4" fill="#fff" stroke="#FFB2DD" strokeWidth="1.6" className="station-id-PK03"></circle>
          </g>
        </g>
        <g id="station_PK04" data-name="station" data-station-id="PK04">
          <g id="label-en-112" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(348.32 308.86)" fontSize="6" fill="#424143">Samakkhi</text> </g>
          <g id="label-th-112" data-name="label-th"><text textRendering="geometricPrecision" transform="translate(348.32 308.86)" fontSize="6" fill="#424143">สามัคคี</text> </g>
          <g id="station-path-112" data-name="station-path">
            <circle cx="339.64" cy="311.77" r="3.4" fill="#fff" stroke="#FFB2DD" strokeWidth="1.6" className="station-id-PK04"></circle>
          </g>
        </g>
        <g id="station_PK05" data-name="station" data-station-id="PK05">
          <g id="label-en-113" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(332.03 298)" fontSize="6" fill="#424143">Wat Chonprathan</text> </g>
          <g id="label-th-113" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(275.02 298)" fontSize="6" fill="#424143">วัดชลประทาน</text> </g>
          <g id="station-path-113" data-name="station-path">
            <circle cx="322.76" cy="294.86" r="3.4" fill="#fff" stroke="#FFB2DD" strokeWidth="1.6" className="station-id-PK05"></circle>
          </g>
        </g>
        <g id="station_PK06" data-name="station" data-station-id="PK06">
          <g id="label-en-114" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(316.65 261.5)" fontSize="6" fill="#424143">Yeak Pak Ket</text> </g>
          <g id="label-th-114" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(310.46 261.5)" fontSize="6" fill="#424143">แยกปากเกร็ด</text> </g>
          <g id="station-path-114" data-name="station-path">
            <circle cx="326.21" cy="270.33" r="3.4" fill="#fff" stroke="#FFB2DD" strokeWidth="1.6" className="station-id-PK06"></circle>
          </g>
        </g>
        <g id="station_PK07" data-name="station" data-station-id="PK07">
          <g id="label-en-115" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(347.87 284.5)" fontSize="6" fill="#424143"><tspan x="0" dy="0">Pak Kret</tspan><tspan x="0" dy="7">Bypass</tspan></text> </g>
          <g id="label-th-115" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(333 284.5)" fontSize="6" fill="#424143">เลี่ยงเมืองปากเกร็ด</text> </g>
          <g id="station-path-115" data-name="station-path">
            <circle cx="357.42" cy="270.33" r="3.4" fill="#fff" stroke="#FFB2DD" strokeWidth="1.6" className="station-id-PK07"></circle>
          </g>
        </g>
        <g id="station_PK08" data-name="station" data-station-id="PK08">
          <g id="label-en-116" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(384.64 255.5)" fontSize="6" fill="#424143"><tspan x="0" dy="0">Chaeng Watthana -</tspan><tspan x="0" dy="7">Pak Kret 28</tspan></text> </g>
          <g id="label-th-116" data-name="label-th"><text textRendering="geometricPrecision" transform="translate(378.29 242.5)" fontSize="6" fill="#424143">
            <tspan x="2" y="0">แจ้งวัฒนะ</tspan>
            <tspan x="12" y="6">-</tspan>
            <tspan x="0" y="13">ปากเกร็ด 28</tspan>
          </text></g>
          <g id="station-path-116" data-name="station-path">
            <circle cx="392.09" cy="270.33" r="3.4" fill="#fff" stroke="#FFB2DD" strokeWidth="1.6" className="station-id-PK08"></circle>
          </g>
        </g>
        <g id="station_PK09" data-name="station" data-station-id="PK09">
          <g id="label-en-117" data-name="label-en"><text textRendering="geometricPrecision" transform="translate(414.23 284.5)" fontSize="6" fill="#424143">Si Rat</text></g>
          <g id="label-th-117" data-name="label-th"><text textRendering="geometricPrecision" transform="translate(420.27 284.5)" fontSize="6" fill="#424143">ศรีรัช</text></g>
          <g id="station-path-117" data-name="station-path">
            <circle cx="427.21" cy="270.33" r="3.4" fill="#fff" stroke="#FFB2DD" strokeWidth="1.6" className="station-id-PK09"></circle>
          </g>
        </g>
        <g id="station_PK10" data-name="station" data-station-id="PK10">
          <g id="station-path-136" data-name="station-path">
            <circle cx="462.76" cy="270.33" r="3.4" fill="#fff" stroke="#FFB2DD" strokeWidth="1.6" className="station-id-PK10"></circle>
          </g>
          <g id="label-en-136" data-name="label-en"><text textRendering="geometricPrecision" transform="translate(455.65 248.5)" fontSize="6" fill="#424143"><tspan x="0" dy="0">Muang Thong</tspan><tspan x="0" dy="7">Thani</tspan></text></g>
          <g id="label-th-136" data-name="label-th"><text textRendering="geometricPrecision" transform="translate(446.58 248.5)" fontSize="6" fill="#424143">เมืองทองธานี</text></g>
        </g>
        <g id="station_PK11" data-name="station" data-station-id="PK11">
          <g id="label-en-118" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(480.51 284.5)" fontSize="6" fill="#424143">Chaeng Watthana 14</text> </g>
          <g id="label-th-118" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(475.56 284.5)" fontSize="6" fill="#424143">แจ้งวัฒนา 14</text> </g>
          <g id="station-path-118" data-name="station-path">
            <circle cx="488.96" cy="270.33" r="3.4" fill="#fff" stroke="#FFB2DD" strokeWidth="1.6" className="station-id-PK11"></circle>
          </g>
        </g>
        <g id="station_PK12" data-name="station" data-station-id="PK12">
          <g id="label-en-119" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(509.05 255.5)" fontSize="6" fill="#424143"><tspan x="0" dy="0">Government</tspan><tspan x="0" dy="7">Complex</tspan></text> </g>
          <g id="label-th-119" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(508.39 255.5)" fontSize="6" fill="#424143">ศูนย์ราชการฯ</text> </g>
          <g id="station-path-119" data-name="station-path">
            <circle cx="522.85" cy="270.33" r="3.4" fill="#fff" stroke="#FFB2DD" strokeWidth="1.6" className="station-id-PK12"></circle>
          </g>
        </g>
        <g id="station_PK13" data-name="station" data-station-id="PK13">
          <g id="label-en-120" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(547.96 284.5)" fontSize="6" fill="#424143"><tspan x="0" dy="0">National</tspan><tspan x="0" dy="7">Telecom</tspan></text> </g>
          <g id="label-th-120" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(546.9 284.5)" fontSize="6" fill="#424143">ทีโอที</text> </g>
          <g id="station-path-120" data-name="station-path">
            <circle cx="552.13" cy="270.33" r="3.4" fill="#fff" stroke="#FFB2DD" strokeWidth="1.6" className="station-id-PK13"></circle>
          </g>
        </g>
        <g id="station_PK15" data-name="station" data-station-id="PK15">
          <g id="label-en-121" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(608.71 284.5)" fontSize="6" fill="#424143"><tspan x="0" dy="0">Rajabhat</tspan><tspan x="0" dy="7">Phranakhon</tspan></text> </g>
          <g id="label-th-121" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(604.53 284.5)" fontSize="6" fill="#424143">ราชภัฏพระนคร</text> </g>
          <g id="station-path-121" data-name="station-path">
            <circle cx="618.6" cy="270.33" r="3.4" fill="#fff" stroke="#FFB2DD" strokeWidth="1.6" className="station-id-PK15"></circle>
          </g>
        </g>
        <g id="station_PK17" data-name="station" data-station-id="PK17">
          <g id="label-en-122" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(720.04 261.5)" fontSize="6" fill="#424143">Ram Inthra 3</text> </g>
          <g id="label-th-122" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(721.91 261.5)" fontSize="6" fill="#424143">รามอินทรา 3</text> </g>
          <g id="station-path-122" data-name="station-path">
            <circle cx="734.76" cy="270.33" r="3.4" fill="#fff" stroke="#FFB2DD" strokeWidth="1.6" className="station-id-PK17"></circle>
          </g>
        </g>
        <g id="station_PK18" data-name="station" data-station-id="PK18">
          <g id="label-en-123" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(770.91 284.5)" fontSize="6" fill="#424143">Lat Pla Khao</text> </g>
          <g id="label-th-123" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(773.52 284.5)" fontSize="6" fill="#424143">ลาดปลาเค้า</text> </g>
          <g id="station-path-123" data-name="station-path">
            <circle cx="785.18" cy="270.33" r="3.4" fill="#fff" stroke="#FFB2DD" strokeWidth="1.6" className="station-id-PK18"></circle>
          </g>
        </g>
        <g id="station_PK19" data-name="station" data-station-id="PK19">
          <g id="label-en-124" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(821.41 255.5)" fontSize="6" fill="#424143"><tspan x="0" dy="0">Ram Inthra</tspan><tspan x="0" dy="7">Kor Mor 4</tspan></text> </g>
          <g id="label-th-124" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(823.27 255.5)" fontSize="6" fill="#424143">รามอินทรา กม.4</text> </g>
          <g id="station-path-124" data-name="station-path">
            <circle cx="837.44" cy="270.33" r="3.4" fill="#fff" stroke="#FFB2DD" strokeWidth="1.6" className="station-id-PK19"></circle>
          </g>
        </g>
        <g id="station_PK20" data-name="station" data-station-id="PK20">
          <g id="label-en-125" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(873.96 284.5)" fontSize="6" fill="#424143">Maiyalap</text> </g>
          <g id="label-th-125" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(876.84 284.5)" fontSize="6" fill="#424143">มัยลาภ</text> </g>
          <g id="station-path-125" data-name="station-path">
            <circle cx="884.03" cy="270.33" r="3.4" fill="#fff" stroke="#FFB2DD" strokeWidth="1.6" className="station-id-PK20"></circle>
          </g>
        </g>
        <g id="station_PK21" data-name="station" data-station-id="PK21">
          <g id="label-en-126" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(913.07 261.5)" fontSize="6" fill="#424143">Vacharaphol</text> </g>
          <g id="label-th-126" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(920.65 261.5)" fontSize="6" fill="#424143">วัชรพล</text> </g>
          <g id="station-path-126" data-name="station-path">
            <circle cx="927.86" cy="270.33" r="3.4" fill="#fff" stroke="#FFB2DD" strokeWidth="1.6" className="station-id-PK21"></circle>
          </g>
        </g>
        <g id="station_PK22" data-name="station" data-station-id="PK22">
          <g id="label-en-127" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(966.02 284.5)" fontSize="6" fill="#424143"><tspan x="0" dy="0">Ram Inthra</tspan><tspan x="0" dy="7">Kor Mor 6</tspan></text> </g>
          <g id="label-th-127" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(967.89 284.5)" fontSize="6" fill="#424143">รามอินทรา กม.6</text> </g>
          <g id="station-path-127" data-name="station-path">
            <circle cx="982.05" cy="270.33" r="3.4" fill="#fff" stroke="#FFB2DD" strokeWidth="1.6" className="station-id-PK22"></circle>
          </g>
        </g>
        <g id="station_PK23" data-name="station" data-station-id="PK23">
          <g id="label-en-128" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(1021.81 261.5)" fontSize="6" fill="#424143">Khu Bon</text> </g>
          <g id="label-th-128" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(1025.38 261.5)" fontSize="6" fill="#424143">คู้บอน</text> </g>
          <g id="station-path-128" data-name="station-path">
            <circle cx="1031.43" cy="270.33" r="3.4" fill="#fff" stroke="#FFB2DD" strokeWidth="1.6" className="station-id-PK23"></circle>
          </g>
        </g>
        <g id="station_PK24" data-name="station" data-station-id="PK24">
          <g id="label-en-129" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(1063.29 284.5)" fontSize="6" fill="#424143"><tspan x="0" dy="0">Ram Inthra</tspan><tspan x="0" dy="7">Kor Mor 9</tspan></text> </g>
          <g id="label-th-129" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(1064.43 284.5)" fontSize="6" fill="#424143">รามอินทรา กม.9</text> </g>
          <g id="station-path-129" data-name="station-path">
            <circle cx="1078.6" cy="270.33" r="3.4" fill="#fff" stroke="#FFB2DD" strokeWidth="1.6" className="station-id-PK24"></circle>
          </g>
        </g>
        <g id="station_PK25" data-name="station" data-station-id="PK25">
          <g id="label-en-130" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(1123.45 290.18)" fontSize="6" fill="#424143"><tspan x="0" dy="0">Outer Ring Road -</tspan><tspan x="0" dy="7">Ram Inthra</tspan></text> </g>
          <g id="label-th-130" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(1123.45 290.18)" fontSize="6" fill="#424143">วงแหวาน- รามอินทรา</text> </g>
          <g id="station-path-130" data-name="station-path">
            <circle cx="1115.58" cy="292.01" r="3.4" fill="#fff" stroke="#FFB2DD" strokeWidth="1.6" className="station-id-PK25"></circle>
          </g>
        </g>
        <g id="station_PK26" data-name="station" data-station-id="PK26">
          <g id="label-en-131" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(1148.7 312.95)" fontSize="6" fill="#424143">Nopparat</text> </g>
          <g id="label-th-131" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(1148.69 312.96)" fontSize="6" fill="#424143">นพรัตน์</text> </g>
          <g id="station-path-131" data-name="station-path">
            <circle cx="1141.41" cy="317.79" r="3.4" fill="#fff" stroke="#FFB2DD" strokeWidth="1.6" className="station-id-PK26"></circle>
          </g>
        </g>
        <g id="station_PK27" data-name="station" data-station-id="PK27">
          <g id="label-en-132" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(1174.19 337.57)" fontSize="6" fill="#424143">Bang Chan</text> </g>
          <g id="label-th-132" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(1174.19 337.58)" fontSize="6" fill="#424143">บางชัน</text> </g>
          <g id="station-path-132" data-name="station-path">
            <circle cx="1166.9" cy="343.41" r="3.4" fill="#fff" stroke="#FFB2DD" strokeWidth="1.6" className="station-id-PK27"></circle>
          </g>
        </g>
        <g id="station_PK28" data-name="station" data-station-id="PK28">
          <g id="label-th-133" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(1201.62 366.16)" fontSize="6" fill="#424143">เศรษฐบุตรบำเพ็ญ</text> </g>
          <g id="label-en-133" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(1202.12 366.16)" fontSize="6" fill="#424143">Setthabutbamphen</text> </g>
          <g id="station-path-133" data-name="station-path">
            <circle cx="1193.29" cy="369.76" r="3.4" fill="#fff" stroke="#FFB2DD" strokeWidth="1.6" className="station-id-PK28"></circle>
          </g>
        </g>
        <g id="station_PK29" data-name="station" data-station-id="PK29">
          <g id="label-en-134" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(1230.51 394.8)" fontSize="6" fill="#424143">Min Buri Market</text> </g>
          <g id="label-th-134" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(1230.51 394.8)" fontSize="6" fill="#424143">ตลาดมีนบุรี</text> </g>
          <g id="station-path-134" data-name="station-path">
            <circle cx="1222.22" cy="398.63" r="3.4" fill="#fff" stroke="#FFB2DD" strokeWidth="1.6" className="station-id-PK29"></circle>
          </g>
        </g>
        <g id="station_PK30" data-name="station" data-station-id="PK30">
          <g id="label-en-135" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(1269.75 433.7)" fontSize="6" fill="#424143">Min Buri</text> </g>
          <g id="label-th-135" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(1269.75 433.7)" fontSize="6" fill="#424143">มีนบุรี</text> </g>
          <g id="station-path-135" data-name="station-path">
            <circle cx="1261.44" cy="437.31" r="3.4" fill="#fff" stroke="#FFB2DD" strokeWidth="1.6" className="station-id-PK30"></circle>
          </g>
        </g>


      </g>
    </g>
    <g id="yellow-line" data-name="train-line">


      <g data-status="open">

        <g id="track-6-2" data-name="track">
          <path d="M53 31.8301H285.248C286.625 31.8262 287.989 32.1006 289.257 32.6367C290.525 33.1728 291.672 33.9598 292.628 34.9501L440.818 187.81C442.687 189.732 443.729 192.309 443.718 194.99V560.13C443.718 562.854 442.636 565.466 440.71 567.392C438.784 569.318 436.172 570.4 433.448 570.4H348.018" stroke="#FCD110" strokeWidth="4" transform="translate(697.6 492.6)" strokeMiterlimit="10"></path>
        </g>


        <g id="station_YL02" data-name="station" data-station-id="YL02">
          <g id="label-en-142" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(789.09 515.94)" fontSize="6" fill="#424143">Phawana</text> </g>
          <g id="label-th-142" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(791.7 515.94)" fontSize="6" fill="#424143">ภาวนา</text> </g>
          <g id="station-path-142" data-name="station-path">
            <circle cx="799.5" cy="524.56" r="3.4" fill="#fff" stroke="#FCD110" strokeWidth="1.6" className="station-id-YL02"></circle>
          </g>
        </g>
        <g id="station_YL03" data-name="station" data-station-id="YL03">
          <g id="label-en-143" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(837.49 515.94)" fontSize="6" fill="#424143">Chok Chai 4</text> </g>
          <g id="label-th-143" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(842.23 515.94)" fontSize="6" fill="#424143">โชคชัย 4</text> </g>
          <g id="station-path-143" data-name="station-path">
            <circle cx="850.98" cy="524.56" r="3.4" fill="#fff" stroke="#FCD110" strokeWidth="1.6" className="station-id-YL03"></circle>
          </g>
        </g>
        <g id="station_YL04" data-name="station" data-station-id="YL04">
          <g id="label-en-144" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(894.24 515.94)" fontSize="6" fill="#424143">Lat Phrao 71</text> </g>
          <g id="label-th-144" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(894.24 515.94)" fontSize="6" fill="#424143">ลาดพร้าว 71</text> </g>
          <g id="station-path-144" data-name="station-path">
            <circle cx="916.29" cy="524.56" r="3.4" fill="#fff" stroke="#FCD110" strokeWidth="1.6" className="station-id-YL04"></circle>
          </g>
        </g>
        <g id="station_YL05" data-name="station" data-station-id="YL05">
          <g id="label-en-145" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(950.32 515.94)" fontSize="6" fill="#424143">Lat Phrao 83</text> </g>
          <g id="label-th-145" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(951.5 513.14)" fontSize="6" fill="#424143">ลาดพร้าว 83</text> </g>
          <g id="station-path-145" data-name="station-path">
            <circle cx="964.53" cy="524.56" r="3.4" fill="#fff" stroke="#FCD110" strokeWidth="1.6" className="station-id-YL05"></circle>
          </g>
        </g>
        <g id="station_YL06" data-name="station" data-station-id="YL06">
          <g id="label-en-146" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(1007.83 536.76)" fontSize="6" fill="#424143">Mahat Thai</text> </g>
          <g id="label-th-146" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(1007.83 536.76)" fontSize="6" fill="#424143">มหาดไทย</text> </g>
          <g id="station-path-146" data-name="station-path">
            <circle cx="998.47" cy="535.81" r="3.4" fill="#fff" stroke="#FCD110" strokeWidth="1.6" className="station-id-YL06"></circle>
          </g>
        </g>
        <g id="station_YL07" data-name="station" data-station-id="YL07">
          <g id="label-en-147" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(983.97 570.57)" fontSize="6" fill="#424143">Lat Phrao 101</text> </g>
          <g id="label-th-147" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(985.59 570.57)" fontSize="6" fill="#424143">ลาดพร้าว 101</text> </g>
          <g id="station-path-147" data-name="station-path">
            <circle cx="1029.53" cy="568.22" r="3.4" fill="#fff" stroke="#FCD110" strokeWidth="1.6" className="station-id-YL07"></circle>
          </g>
        </g>
        <g id="station_YL08" data-name="station" data-station-id="YL08">
          <g id="label-en-148" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(1013.6 598.87)" fontSize="6" fill="#424143">Bang Kapi</text> </g>
          <g id="label-th-148" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(1028.38 598.87)" fontSize="6" fill="#424143">บางกะปิ</text> </g>
          <g id="station-path-148" data-name="station-path">
            <circle cx="1056.76" cy="595.47" r="3.4" fill="#fff" stroke="#FCD110" strokeWidth="1.6" className="station-id-YL08"></circle>
          </g>
        </g>
        <g id="station_YL09" data-name="station" data-station-id="YL09">
          <g id="label-en-149" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(1028.23 622.04)" fontSize="6" fill="#424143">Yaek Lam Sali</text> </g>
          <g id="label-th-149" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(1042.23 622.04)" fontSize="6" fill="#424143">แยกลำสาลี</text> </g>
          <g id="station-path-149" data-name="station-path">
            <circle cx="1078.58" cy="618.09" r="3.4" fill="#fff" stroke="#FCD110" strokeWidth="1.6" className="station-id-YL09"></circle>
          </g>
        </g>
        <g id="station_YL10" data-name="station" data-station-id="YL10">
          <g id="label-en-150" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(1140.08 670.04)" fontSize="6" fill="#424143">Si Kritha</text> </g>
          <g id="label-th-150" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(1140.08 670.04)" fontSize="6" fill="#424143">ศรีกรีฑา</text> </g>
          <g id="station-path-150" data-name="station-path">
            <circle cx="1131.54" cy="673.56" r="3.4" fill="#fff" stroke="#FCD110" strokeWidth="1.6" className="station-id-YL10"></circle>
          </g>
        </g>

        <g id="station_YL12" data-name="station" data-station-id="YL12">
          <g id="label-en-152" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(1150.17 770.7)" fontSize="6" fill="#424143">Kalantan</text> </g>
          <g id="label-th-152" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(1150.17 770.7)" fontSize="6" fill="#424143">กลันตัน</text> </g>
          <g id="station-path-152" data-name="station-path">
            <circle cx="1141.87" cy="768.68" r="3.4" fill="#fff" stroke="#FCD110" strokeWidth="1.6" className="station-id-YL12"></circle>
          </g>
        </g>
        <g id="station_YL13" data-name="station" data-station-id="YL13">
          <g id="label-en-153" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(1150.17 807.03)" fontSize="6" fill="#424143">Si Nut</text> </g>
          <g id="label-th-153" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(1150.17 807.03)" fontSize="6" fill="#424143">ศรีนุช</text> </g>
          <g id="station-path-153" data-name="station-path">
            <circle cx="1141.87" cy="805.01" r="3.4" fill="#fff" stroke="#FCD110" strokeWidth="1.6" className="station-id-YL13"></circle>
          </g>
        </g>
        <g id="station_YL14" data-name="station" data-station-id="YL14">
          <g id="label-en-154" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(1150.17 841.57)" fontSize="6" fill="#424143">Srinagarindra 38</text> </g>
          <g id="label-th-154" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(1150.17 841.57)" fontSize="6" fill="#424143">ศรีนครินทร์ 38</text> </g>
          <g id="station-path-154" data-name="station-path">
            <circle cx="1141.87" cy="839.55" r="3.4" fill="#fff" stroke="#FCD110" strokeWidth="1.6" className="station-id-YL14"></circle>
          </g>
        </g>
        <g id="station_YL15" data-name="station" data-station-id="YL15">
          <g id="label-en-155" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(1150.17 876.51)" fontSize="6" fill="#424143">Suan Luang Rama IX</text> </g>
          <g id="label-th-155" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(1150.17 876.51)" fontSize="6" fill="#424143">สวนหลวง ร.9</text> </g>
          <g id="station-path-155" data-name="station-path">
            <circle cx="1141.87" cy="874.49" r="3.4" fill="#fff" stroke="#FCD110" strokeWidth="1.6" className="station-id-YL15"></circle>
          </g>
        </g>
        <g id="station_YL16" data-name="station" data-station-id="YL16">
          <g id="label-en-156" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(1150.17 906.76)" fontSize="6" fill="#424143">Si Udom</text> </g>
          <g id="label-th-156" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(1150.17 906.76)" fontSize="6" fill="#424143">ศรีอุดม</text> </g>
          <g id="station-path-156" data-name="station-path">
            <circle cx="1141.76" cy="904.74" r="3.4" fill="#fff" stroke="#FCD110" strokeWidth="1.6" className="station-id-YL16"></circle>
          </g>
        </g>
        <g id="station_YL17" data-name="station" data-station-id="YL17">
          <g id="label-en-157" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(1150.17 943.85)" fontSize="6" fill="#424143">Si Iam</text> </g>
          <g id="label-th-157" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(1150.17 943.85)" fontSize="6" fill="#424143">ศรีเอี่ยม</text> </g>
          <g id="station-path-157" data-name="station-path">
            <circle cx="1141.76" cy="941.83" r="3.4" fill="#fff" stroke="#FCD110" strokeWidth="1.6" className="station-id-YL17"></circle>
          </g>
        </g>
        <g id="station_YL18" data-name="station" data-station-id="YL18">
          <g id="label-en-158" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(1150.17 977.41)" fontSize="6" fill="#424143">Si La Salle</text> </g>
          <g id="label-th-158" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(1150.17 977.41)" fontSize="6" fill="#424143">ศรีลาซาล</text> </g>
          <g id="station-path-158" data-name="station-path">
            <circle cx="1141.96" cy="975.39" r="3.4" fill="#fff" stroke="#FCD110" strokeWidth="1.6" className="station-id-YL18"></circle>
          </g>
        </g>
        <g id="station_YL19" data-name="station" data-station-id="YL19">
          <g id="label-en-159" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(1150.17 1012.97)" fontSize="6" fill="#424143">Si Bearing</text> </g>
          <g id="label-th-159" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(1150.17 1012.97)" fontSize="6" fill="#424143">ศรีแบริ่ง</text> </g>
          <g id="station-path-159" data-name="station-path">
            <circle cx="1141.96" cy="1010.94" r="3.4" fill="#fff" stroke="#FCD110" strokeWidth="1.6" className="station-id-YL19"></circle>
          </g>
        </g>
        <g id="station_YL20" data-name="station" data-station-id="YL20">
          <g id="label-en-160" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(1150.17 1045.24)" fontSize="6" fill="#424143">Si Dan</text> </g>
          <g id="label-th-160" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(1150.17 1045.24)" fontSize="6" fill="#424143">ศรีด่าน</text> </g>
          <g id="station-path-160" data-name="station-path">
            <circle cx="1141.96" cy="1043.22" r="3.4" fill="#fff" stroke="#FCD110" strokeWidth="1.6" className="station-id-YL20"></circle>
          </g>
        </g>
        <g id="station_YL21" data-name="station" data-station-id="YL21">
          <g id="label-en-161" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(1103.6 1052.71)" fontSize="6" fill="#424143">Si Thepha</text> </g>
          <g id="label-th-161" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(1106.83 1052.71)" fontSize="6" fill="#424143">ศรีเทพา</text> </g>
          <g id="station-path-161" data-name="station-path">
            <circle cx="1116.29" cy="1063.38" r="3.4" fill="#fff" stroke="#FCD110" strokeWidth="1.6" className="station-id-YL21"></circle>
          </g>
        </g>
        <g id="station_YL22" data-name="station" data-station-id="YL22">
          <g id="label-en-162" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(1066.75 1052.65)" fontSize="6" fill="#424143">Thipphawan</text> </g>
          <g id="label-th-162" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(1075.25 1052.65)" fontSize="6" fill="#424143">ทิพวัล</text> </g>
          <g id="station-path-162" data-name="station-path">
            <circle cx="1082.53" cy="1063.38" r="3.4" fill="#fff" stroke="#FCD110" strokeWidth="1.6" className="station-id-YL22"></circle>
          </g>
        </g>

      </g>
    </g>
    <g id="gold-line" data-name="train-line">


      <g data-status="open">
        <g id="track-7" data-name="track">
          <path id="Line-14" d="M596.869 994.82L600.079 991.31C600.821 990.503 601.225 989.443 601.208 988.347C601.192 987.251 600.755 986.204 599.989 985.42L557.499 942" stroke="#D0AB4F" strokeWidth="4" strokeMiterlimit="10"></path>
        </g>




        <g id="station_G2" data-name="station" data-station-id="G2">
          <g id="label-en-165" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(594.27 971.47)" fontSize="6" fill="#424143">Charoen Na Korn</text> </g>
          <g id="label-th-165" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(594.27 971.47)" fontSize="6" fill="#424143">เจริญนคร</text> </g>
          <g id="station-path-165" data-name="station-path">
            <circle cx="584.81" cy="970.26" r="3.4" fill="#fff" stroke="#D0AB4F" strokeWidth="1.6" className="station-id-G2"></circle>
          </g>
        </g>
        <g id="station_G3" data-name="station" data-station-id="G3">
          <g id="label-en-166" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(569.64 943.22)" fontSize="6" fill="#424143">Klong San</text> </g>
          <g id="label-th-166" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(569.64 943.22)" fontSize="6" fill="#424143">คลองสาน</text> </g>
          <g id="station-path-166" data-name="station-path">
            <circle cx="558.52" cy="942.23" r="3.4" fill="#fff" stroke="#D0AB4F" strokeWidth="1.6" className="station-id-G3"></circle>
          </g>
        </g>
      </g>


    </g>
    <g id="purple-line" data-name="train-line">
      <g data-status="open">
        <g id="track-8" data-name="track">
          <path id="Line-15" d="M80.4,393.5v46.61a6.5,6.5,0,0,0,6.5,6.5H402.19a6.51,6.51,0,0,1,6.49,6.49v17.16a6.49,6.49,0,0,0,1.9,4.6L534.31,598.59a6.5,6.5,0,0,1,1.91,4.59v60.34" transform="translate(-25.75 -52.38)" fill="none" stroke="#9B54A2" strokeMiterlimit="10" strokeWidth="4"></path>
        </g>
        <g id="station_PP01" data-name="station" data-station-id="PP01">
          <g id="label-en-168" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(64 342.5)" fontSize="6" fill="#424143">Khlong Bang Phai</text> </g>
          <g id="label-th-168" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(64 342.5)" fontSize="6" fill="#424143">คลองบางไผ่</text> </g>
          <g id="station-path-168" data-name="station-path">
            <circle cx="54.66" cy="340.45" r="3.4" fill="#fff" stroke="#9B54A2" strokeWidth="1.6" className="station-id-PP01"></circle>
          </g>
        </g>
        <g id="station_PP02" data-name="station" data-station-id="PP02">
          <g id="label-en-169" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(64 366.5)" fontSize="6" fill="#424143">Talad Bang Yai</text> </g>
          <g id="label-th-169" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(64 366.5)" fontSize="6" fill="#424143">ตลาดบางใหญ่</text> </g>
          <g id="station-path-169" data-name="station-path">
            <circle cx="54.64" cy="364.51" r="3.4" fill="#fff" stroke="#9B54A2" strokeWidth="1.6" className="station-id-PP02"></circle>
          </g>
        </g>
        <g id="station_PP03" data-name="station" data-station-id="PP03">
          <g id="label-en-170" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(52 405.5)" fontSize="6" fill="#424143">Sam Yaek Bang Yai</text> </g>
          <g id="label-th-170" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(54 405.5)" fontSize="6" fill="#424143">สามแยกบางใหญ่</text> </g>
          <g id="station-path-170" data-name="station-path">
            <circle cx="78.7" cy="393.46" r="3.4" fill="#fff" stroke="#9B54A2" strokeWidth="1.6" className="station-id-PP03"></circle>
          </g>
        </g>
        <g id="station_PP04" data-name="station" data-station-id="PP04">
          <g id="label-en-171" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(106 383.5)" fontSize="6" fill="#424143">Bang Phlu</text> </g>
          <g id="label-th-171" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(110.7 383.5)" fontSize="6" fill="#424143">บางพลู</text> </g>
          <g id="station-path-171" data-name="station-path">
            <circle cx="117.81" cy="393.46" r="3.4" fill="#fff" stroke="#9B54A2" strokeWidth="1.6" className="station-id-PP04"></circle>
          </g>
        </g>
        <g id="station_PP05" data-name="station" data-station-id="PP05">
          <g id="station-path-172" data-name="station-path">
            <circle cx="150.89" cy="393.46" r="3.4" fill="#fff" stroke="#9B54A2" strokeWidth="1.6" className="station-id-PP05"></circle>
          </g>
          <g id="label-en-172" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(132 405.5)" fontSize="6" fill="#424143">Bang Rak Yai</text> </g>
          <g id="label-th-172" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(139.53 405.5)" fontSize="6" fill="#424143">บางรักใหญ่</text> </g>
        </g>
        <g id="station_PP06" data-name="station" data-station-id="PP06">
          <g id="label-en-173" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(155 383.5)" fontSize="6" fill="#424143">Bang Rak Noi-Tha It</text> </g>
          <g id="label-th-173" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(165 383.5)" fontSize="6" fill="#424143">บางรักน้อย-ท่าอิฐ</text> </g>
          <g id="station-path-173" data-name="station-path">
            <circle cx="184.26" cy="393.46" r="3.4" fill="#fff" stroke="#9B54A2" strokeWidth="1.6" className="station-id-PP06"></circle>
          </g>
        </g>
        <g id="station_PP07" data-name="station" data-station-id="PP07">
          <g id="station-path-174" data-name="station-path">
            <circle cx="216.34" cy="393.46" r="3.4" fill="#fff" stroke="#9B54A2" strokeWidth="1.6" className="station-id-PP07"></circle>
          </g>
          <g id="label-en-174" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(208 405.5)" fontSize="6" fill="#424143">Sai Ma</text> </g>
          <g id="label-th-174" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(210.04 405.5)" fontSize="6" fill="#424143">ไทรม้า</text> </g>
        </g>
        <g id="station_PP08" data-name="station" data-station-id="PP08">
          <g id="station-path-175" data-name="station-path">
            <circle cx="256.29" cy="393.46" r="3.4" fill="#fff" stroke="#9B54A2" strokeWidth="1.6" className="station-id-PP08"></circle>
          </g>
          <g id="label-en-175" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(237 400.5)" fontSize="6" fill="#424143">
            <tspan x="0.147461" y="4.68182">Phra Nang Klao</tspan>
            <tspan x="12.7832" y="11.6818">Bridge</tspan>
          </text> </g>
          <g id="label-th-175" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(231.85 405.5)" fontSize="6" fill="#424143">สะพานพระนั่งเกล้า</text> </g>
        </g>
        <g id="station_PP09" data-name="station" data-station-id="PP09">
          <g id="station-path-176" data-name="station-path">
            <circle cx="289.37" cy="393.46" r="3.4" fill="#fff" stroke="#9B54A2" strokeWidth="1.6" className="station-id-PP09"></circle>
          </g>
          <g id="label-en-176" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(267 383.5)" fontSize="6" fill="#424143">Yaek Nonthaburi 1</text> </g>
          <g id="label-th-176" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(275.54 383.5)" fontSize="6" fill="#424143">แยกนนทบุรี 1</text> </g>
        </g>
        <g id="station_PP10" data-name="station" data-station-id="PP10">
          <g id="station-path-177" data-name="station-path">
            <circle cx="324.26" cy="393.46" r="3.4" fill="#fff" stroke="#9B54A2" strokeWidth="1.6" className="station-id-PP10"></circle>
          </g>
          <g id="label-en-177" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(308 405.5)" fontSize="6" fill="#424143">Bang Krasor</text> </g>
          <g id="label-th-177" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(313.81 405.5)" fontSize="6" fill="#424143">บางกระสอ</text> </g>
        </g>

        <g id="station_PP12" data-name="station" data-station-id="PP12">
          <g id="label-en-179" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(420 448.32)" fontSize="6" fill="#424143">Ministry of Public Health</text> </g>
          <g id="label-th-179" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(420 448.32)" fontSize="6" fill="#424143">กระทรวงสาธารณสุข</text> </g>
          <g id="station-path-179" data-name="station-path">
            <circle cx="410.72" cy="448.61" r="3.4" fill="#fff" stroke="#9B54A2" strokeWidth="1.6" className="station-id-PP12"></circle>
          </g>
        </g>
        <g id="station_PP13" data-name="station" data-station-id="PP13">
          <g id="label-en-180" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(453.13 484.02)" fontSize="6" fill="#424143">Yaek Tiwanon</text> </g>
          <g id="label-th-180" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(452.86 484.02)" fontSize="6" fill="#424143">แยกติวานนท์</text> </g>
          <g id="station-path-180" data-name="station-path">
            <circle cx="444.69" cy="482.81" r="3.4" fill="#fff" stroke="#9B54A2" strokeWidth="1.6" className="station-id-PP13"></circle>
          </g>
        </g>
        <g id="station_PP14" data-name="station" data-station-id="PP14">
          <g id="label-en-181" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(487.01 517.54)" fontSize="6" fill="#424143">Wong Sawang</text> </g>
          <g id="label-th-181" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(487.01 517.54)" fontSize="6" fill="#424143">วงศ์สว่าง</text> </g>
          <g id="station-path-181" data-name="station-path">
            <circle cx="478.68" cy="516.33" r="3.4" fill="#fff" stroke="#9B54A2" strokeWidth="1.6" className="station-id-PP14"></circle>
          </g>
        </g>

      </g>

    </g>
    <g id="mrt" data-name="train-line">

      <g data-status="open">
        <g id="track-11" data-name="track">
          <path id="Line-19" d="M232,970.48H476.34a7.42,7.42,0,0,0,5.24-2.17l41.1-41.1a7.42,7.42,0,0,1,5.25-2.17H865.39a7.43,7.43,0,0,0,7.42-7.43V682.37a7.46,7.46,0,0,0-2-5.07l-80.64-86.37a7.42,7.42,0,0,0-5.42-2.35l-92.47.83a5.19,5.19,0,0,0-5.15,5.2v61.83a7.43,7.43,0,0,1-7.42,7.43H515.44a7.42,7.42,0,0,0-5.25,2.17l-78,78a7.39,7.39,0,0,0-2.18,5.25V970.48" transform="translate(-25.75 -52.38)" fill="none" stroke="#0e6494" strokeMiterlimit="10" strokeWidth="4"></path>
        </g>
        <g id="station_BL01" data-name="station" data-station-id="BL01">
          <g id="label-en-205" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(408.17 912.08)" fontSize="6" fill="#424143">Tha Phra</text> </g>
          <g id="label-th-205" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(411.42 912.08)" fontSize="6" fill="#424143">ท่าพระ</text> </g>
          <g id="station-path-205" data-name="station-path">
            <circle cx="404.26" cy="918.11" r="3.4" fill="#fff" stroke="#0e6494" strokeWidth="1.6" className="station-id-BL01"></circle>
          </g>
        </g>
        <g id="station_BL02" data-name="station" data-station-id="BL02">
          <g id="label-en-206" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(370.04 880.44)" fontSize="6" fill="#424143">Charan 13</text> </g>
          <g id="label-th-206" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(377 879.5)" fontSize="6" fill="#424143">จรัญ 13</text> </g>
          <g id="station-path-206" data-name="station-path">
            <circle cx="404.26" cy="877.84" r="3.4" fill="#fff" stroke="#0e6494" strokeWidth="1.6" className="station-id-BL02"></circle>
          </g>
        </g>
        <g id="station_BL03" data-name="station" data-station-id="BL03">
          <g id="label-en-207" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(374.73 848.5)" fontSize="6" fill="#424143">Fai Chai</text> </g>
          <g id="label-th-207" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(381 848.5)" fontSize="6" fill="#424143">ไฟฉาย</text> </g>
          <g id="station-path-207" data-name="station-path">
            <circle cx="404.26" cy="846.67" r="3.4" fill="#fff" stroke="#0e6494" strokeWidth="1.6" className="station-id-BL03"></circle>
          </g>
        </g>
        <g id="station_BL04" data-name="station" data-station-id="BL04">
          <g id="label-en-208" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(354.03 800)" fontSize="6" fill="#424143">Bang Khun Non</text> </g>
          <g id="label-th-208" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(369 800)" fontSize="6" fill="#424143">บางขุนนนท์</text> </g>
          <g id="station-path-208" data-name="station-path">
            <circle cx="404.26" cy="798.36" r="3.4" fill="#fff" stroke="#0e6494" strokeWidth="1.6" className="station-id-BL04"></circle>
          </g>
        </g>
        <g id="station_BL05" data-name="station" data-station-id="BL05">
          <g id="label-en-209" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(360.79 768.7)" fontSize="6" fill="#424143">Bang Yi Khan</text> </g>
          <g id="label-th-209" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(377 768.7)" fontSize="6" fill="#424143">บางยี่ขัน</text> </g>
          <g id="station-path-209" data-name="station-path">
            <circle cx="404.26" cy="766.99" r="3.4" fill="#fff" stroke="#0e6494" strokeWidth="1.6" className="station-id-BL05"></circle>
          </g>
        </g>
        <g id="station_BL06" data-name="station" data-station-id="BL06">
          <g id="label-en-210" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(367.91 723.5)" fontSize="6" fill="#424143">Sirindhorn</text> </g>
          <g id="label-th-210" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(380 723.5)" fontSize="6" fill="#424143">สิรินธร</text> </g>
          <g id="station-path-210" data-name="station-path">
            <circle cx="404.26" cy="721.96" r="3.4" fill="#fff" stroke="#0e6494" strokeWidth="1.6" className="station-id-BL06"></circle>
          </g>
        </g>
        <g id="station_BL07" data-name="station" data-station-id="BL07">
          <g id="label-en-211" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(383.92 678.13)" fontSize="6" fill="#424143">Bang Phlat</text> </g>
          <g id="label-th-211" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(390.25 678.13)" fontSize="6" fill="#424143">บางพลัด</text> </g>
          <g id="station-path-211" data-name="station-path">
            <circle cx="420.68" cy="676.92" r="3.4" fill="#fff" stroke="#0e6494" strokeWidth="1.6" className="station-id-BL07"></circle>
          </g>
        </g>
        <g id="station_BL08" data-name="station" data-station-id="BL08">
          <g id="label-en-212" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(415.23 656.24)" fontSize="6" fill="#424143">Bang O</text> </g>
          <g id="label-th-212" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(417.12 656.24)" fontSize="6" fill="#424143">บางอ้อ</text> </g>
          <g id="station-path-212" data-name="station-path">
            <circle cx="442.57" cy="655.03" r="3.4" fill="#fff" stroke="#0e6494" strokeWidth="1.6" className="station-id-BL08"></circle>
          </g>
        </g>
        <g id="station_BL09" data-name="station" data-station-id="BL09">
          <g id="label-en-213" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(433.31 631.65)" fontSize="6" fill="#424143">Bang Pho</text> </g>
          <g id="label-th-213" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(442.2 631.65)" fontSize="6" fill="#424143">บางโพ</text> </g>
          <g id="station-path-213" data-name="station-path">
            <circle cx="467.15" cy="630.44" r="3.4" fill="#fff" stroke="#0e6494" strokeWidth="1.6" className="station-id-BL09"></circle>
          </g>
        </g>


        <g id="station_BL12" data-name="station" data-station-id="BL12">
          <g id="label-en-216" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(614 622.2)" fontSize="6" fill="#424143">Kamphaeng Phet</text> </g>
          <g id="label-th-216" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(620 622.2)" fontSize="6" fill="#424143">กำแพงเพชร</text> </g>
          <g id="station-path-216" data-name="station-path">
            <circle cx="635.07" cy="611.21" r="3.4" fill="#fff" stroke="#0e6494" strokeWidth="1.6" className="station-id-BL12"></circle>
          </g>
        </g>

        <g id="station_BL14" data-name="station" data-station-id="BL14">
          <g id="label-en-218" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(684 547.58)" fontSize="6" fill="#424143">Phahon Yothin</text> </g>
          <g id="label-th-218" data-name="label-th">
            <text textRendering="geometricPrecision" transform="translate(684 547.58)" fontSize="6" fill="#424143">พหลโยธิน</text>
          </g>
          <g id="station-path-218" data-name="station-path">
            <circle cx="685.38" cy="536.18" r="3.4" fill="#fff" stroke="#0e6494" strokeWidth="1.6" className="station-id-BL14"></circle>
          </g>
        </g>

        <g id="station_BL16" data-name="station" data-station-id="BL16">
          <g id="label-en-220" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(794.98 563.39)" fontSize="6" fill="#424143">Ratchadaphisek</text> </g>
          <g id="label-th-220" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(794.98 563.39)" fontSize="6" fill="#424143">รัชดาภิเษก</text> </g>
          <g id="station-path-220" data-name="station-path">
            <circle cx="786.02" cy="562.05" r="3.4" fill="#fff" stroke="#0e6494" strokeWidth="1.6" className="station-id-BL16"></circle>
          </g>
        </g>
        <g id="station_BL17" data-name="station" data-station-id="BL17">
          <g id="label-en-221" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(817.58 587.85)" fontSize="6" fill="#424143">Sutthisan</text> </g>
          <g id="label-th-221" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(817.58 587.85)" fontSize="6" fill="#424143">สุทธิสาร</text> </g>
          <g id="station-path-221" data-name="station-path">
            <circle cx="808.62" cy="586.51" r="3.4" fill="#fff" stroke="#0e6494" strokeWidth="1.6" className="station-id-BL17"></circle>
          </g>
        </g>
        <g id="station_BL18" data-name="station" data-station-id="BL18">
          <g id="label-en-222" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(839.68 610.15)" fontSize="6" fill="#424143">Huai Khwang</text> </g>
          <g id="label-th-222" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(839.68 610.15)" fontSize="6" fill="#424143">ห้วยขวาง</text> </g>
          <g id="station-path-222" data-name="station-path">
            <circle cx="830.72" cy="608.81" r="3.4" fill="#fff" stroke="#0e6494" strokeWidth="1.6" className="station-id-BL18"></circle>
          </g>
        </g>
        <g id="station_BL19" data-name="station" data-station-id="BL19">
          <g id="label-en-223" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(856.02 635.74)" fontSize="6" fill="#424143">Thailand Cultural Centre</text> </g>
          <g id="label-th-223" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(856.29 635.42)" fontSize="6" fill="#424143">ศูนย์วัฒนธรรมแห่งประเทศไทย</text> </g>
          <g id="station-path-223" data-name="station-path">
            <circle cx="847.06" cy="634.08" r="3.4" fill="#fff" stroke="#0e6494" strokeWidth="1.6" className="station-id-BL19"></circle>
          </g>
        </g>
        <g id="station_BL20" data-name="station" data-station-id="BL20">
          <g id="label-en-224" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(856.02 682.38)" fontSize="6" fill="#424143">Phra Ram 9</text> </g>
          <g id="station-path-224" data-name="station-path">
            <circle cx="847.06" cy="681.17" r="3.4" fill="#fff" stroke="#0e6494" strokeWidth="1.6" className="station-id-BL20"></circle>
          </g>
          <g id="label-th-224" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(856.02 682.38)" fontSize="6" fill="#424143">พระราม 9</text> </g>
        </g>


        <g id="station_BL23" data-name="station" data-station-id="BL23">
          <g id="label-en-227" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(856.39 870.22)" fontSize="6" fill="#424143">QSNCC</text> </g>
          <g id="label-th-227" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(856.39 870.23)" fontSize="6" fill="#424143">ศูนย์ฯ สิริกิติ์</text> </g>
          <g id="station-path-227" data-name="station-path">
            <circle cx="847.06" cy="866.83" r="3.4" fill="#fff" stroke="#0e6494" strokeWidth="1.6" className="station-id-BL23"></circle>
          </g>
        </g>
        <g id="station_BL24" data-name="station" data-station-id="BL24">
          <g id="label-en-228" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(793.04 865.03)" fontSize="6" fill="#424143">Khlong Toei</text> </g>
          <g id="label-th-228" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(799.23 865.03)" fontSize="6" fill="#424143">คลองเตย</text> </g>
          <g id="station-path-228" data-name="station-path">
            <circle cx="809.12" cy="872.65" r="3.4" fill="#fff" stroke="#0e6494" strokeWidth="1.6" className="station-id-BL24"></circle>
          </g>
        </g>
        <g id="station_BL25" data-name="station" data-station-id="BL25">
          <g id="label-en-229" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(722.99 865.03)" fontSize="6" fill="#424143">Lumphini</text> </g>
          <g id="label-th-229" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(727.38 865.03)" fontSize="6" fill="#424143">ลุมพินี</text> </g>
          <g id="station-path-229" data-name="station-path">
            <circle cx="733.72" cy="872.65" r="3.4" fill="#fff" stroke="#0e6494" strokeWidth="1.6" className="station-id-BL25"></circle>
          </g>
        </g>

        <g id="station_BL27" data-name="station" data-station-id="BL27">
          <g id="label-en-231" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(636.31 865.03)" fontSize="6" fill="#424143">Sam Yan</text> </g>
          <g id="label-th-231" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(637.97 865.03)" fontSize="6" fill="#424143">สามย่าน</text> </g>
          <g id="station-path-231" data-name="station-path">
            <circle cx="646.25" cy="872.65" r="3.4" fill="#fff" stroke="#0e6494" strokeWidth="1.6" className="station-id-BL27"></circle>
          </g>
        </g>
        <g id="station_BL28" data-name="station" data-station-id="BL28">
          <g id="label-en-232" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(586.51 865.03)" fontSize="6" fill="#424143">Hua Lamphong</text> </g>
          <g id="label-th-232" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(586.51 865.03)" fontSize="6" fill="#424143">หัวลำโพง</text> </g>
          <g id="station-path-232" data-name="station-path">
            <circle cx="606.05" cy="872.65" r="3.4" fill="#fff" stroke="#0e6494" strokeWidth="1.6" className="station-id-BL28"></circle>
          </g>
        </g>
        <g id="station_BL29" data-name="station" data-station-id="BL29">
          <g id="label-en-233" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(546.16 884.65)" fontSize="6" fill="#424143">Wat Mangkon</text> </g>
          <g id="label-th-233" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(546.16 884.65)" fontSize="6" fill="#424143">วัดมังกร</text> </g>
          <g id="station-path-233" data-name="station-path">
            <circle cx="565.46" cy="872.65" r="3.4" fill="#fff" stroke="#0e6494" strokeWidth="1.6" className="station-id-BL29"></circle>
          </g>
        </g>
        <g id="station_BL30" data-name="station" data-station-id="BL30">
          <g id="label-en-234" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(522.79 864.6)" fontSize="6" fill="#424143">Sam Yot</text> </g>
          <g id="label-th-234" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(523.47 864.6)" fontSize="6" fill="#424143">สามยอด</text> </g>
          <g id="station-path-234" data-name="station-path">
            <circle cx="532.14" cy="872.65" r="3.4" fill="#fff" stroke="#0e6494" strokeWidth="1.6" className="station-id-BL30"></circle>
          </g>
        </g>
        <g id="station_BL31" data-name="station" data-station-id="BL31">
          <g id="label-en-235" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(477.34 906.2)" fontSize="6" fill="#424143">Sanam Chai</text> </g>
          <g id="label-th-235" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(477.17 906.2)" fontSize="6" fill="#424143">สนามไชย</text> </g>
          <g id="station-path-235" data-name="station-path">
            <circle cx="476.81" cy="895.15" r="3.4" fill="#fff" stroke="#0e6494" strokeWidth="1.6" className="station-id-BL31"></circle>
          </g>
        </g>
        <g id="station_BL32" data-name="station" data-station-id="BL32">
          <g id="label-th-236" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(428.22 928.01)" fontSize="6" fill="#424143">อิสรภาพ</text> </g>
          <g id="label-en-236" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(424.99 928.01)" fontSize="6" fill="#424143">Itsaraphap</text> </g>
          <g id="station-path-236" data-name="station-path">
            <circle cx="438.31" cy="918.11" r="3.4" fill="#fff" stroke="#0e6494" strokeWidth="1.6" className="station-id-BL32"></circle>
          </g>
        </g>
        <g id="station_BL33" data-name="station" data-station-id="BL33">
          <g id="label-en-237" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(361.36 910.25)" fontSize="6" fill="#424143">Bang Phai</text> </g>
          <g id="label-th-237" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(366.62 910.25)" fontSize="6" fill="#424143">บางไผ่</text> </g>
          <g id="station-path-237" data-name="station-path">
            <circle cx="372.88" cy="918.11" r="3.4" fill="#fff" stroke="#0e6494" strokeWidth="1.6" className="station-id-BL33"></circle>
          </g>
        </g>

        <g id="station_BL35" data-name="station" data-station-id="BL35">
          <g id="label-en-239" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(275.9 910.25)" fontSize="6" fill="#424143">Phetkasem 48</text> </g>
          <g id="label-th-239" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(277.9 910.25)" fontSize="6" fill="#424143">เพชรเกษม48</text> </g>
          <g id="station-path-239" data-name="station-path">
            <circle cx="296.62" cy="917.51" r="3.4" fill="#fff" stroke="#0e6494" strokeWidth="1.6" className="station-id-BL35"></circle>
          </g>
        </g>
        <g id="station_BL36" data-name="station" data-station-id="BL36">
          <g id="label-en-240" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(248.45 929.63)" fontSize="6" fill="#424143">Phasi Charoen</text> </g>
          <g id="label-th-240" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(254.45 929.63)" fontSize="6" fill="#424143">ภาษีเจริญ</text> </g>
          <g id="station-path-240" data-name="station-path">
            <circle cx="295.06" cy="969.97" r="3.41" transform="translate(-716.97 1152.45) rotate(-86.47)" fill="#fff" stroke="#0e6494" strokeMiterlimit="4.01" strokeWidth="1.6" className="station-id-BL36"></circle>
          </g>
        </g>
        <g id="station_BL37" data-name="station" data-station-id="BL37">
          <g id="label-en-241" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(222.14 910.25)" fontSize="6" fill="#424143">Bang Khae</text> </g>
          <g id="label-th-241" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(229.22 909.63)" fontSize="6" fill="#424143">บางแค</text> </g>
          <g id="station-path-241" data-name="station-path">
            <circle cx="235.96" cy="917.51" r="3.4" fill="#fff" stroke="#0e6494" strokeWidth="1.6" className="station-id-BL37"></circle>
          </g>
        </g>
        <g id="station_BL38" data-name="station" data-station-id="BL38">
          <g id="label-en-242" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(192.61 929.63)" fontSize="6" fill="#424143">Lak Song</text> </g>
          <g id="label-th-242" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(197.49 909.64)" fontSize="6" fill="#424143">หลักสอง</text> </g>
          <g id="station-path-242" data-name="station-path">
            <circle cx="206.01" cy="917.51" r="3.4" fill="#fff" stroke="#0e6494" strokeWidth="1.6" className="station-id-BL38"></circle>
          </g>
        </g>
      </g>
    </g>

    <g id="bts-silom" data-name="train-line" data-status="open">
      <g id="track-13" data-name="track">
        <path id="Line-21" d="M362.21,976.66l76.5,76.5a7.55,7.55,0,0,0,5.34,2.21H672.61a7.51,7.51,0,0,0,5.33-2.21l49.29-49.29a7.55,7.55,0,0,0,2.21-5.34V882.17a7.56,7.56,0,0,0-7.54-7.54h-54" transform="translate(-25.75 -52.38)" fill="none" stroke="#046461" strokeMiterlimit="10" strokeWidth="4"></path>
      </g>
      <g id="station_W1" data-name="station" data-station-id="W1">
        <g id="label-en-271" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(620 832.69)" fontSize="6" fill="#424143">National Stadium</text> </g>
        <g id="label-th-271" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(620 832.69)" fontSize="6" fill="#424143">สนามกีฬาแห่งชาติ</text> </g>
        <g id="station-path-271" data-name="station-path">
          <circle cx="642.25" cy="822.03" r="3.4" fill="#fff" stroke="#046461" strokeWidth="1.6" className="station-id-W1"></circle>
        </g>
      </g>

      <g id="station_S1" data-name="station" data-station-id="S1">
        <g id="label-en-273" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(711.39 834.86)" fontSize="6" fill="#424143">Ratchadamri</text> </g>
        <g id="label-th-273" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(711.39 834.86)" fontSize="6" fill="#424143">ราชดำริ</text> </g>
        <g id="station-path-273" data-name="station-path">
          <circle cx="703.59" cy="832.65" r="3.4" fill="#fff" stroke="#046461" strokeWidth="1.6" className="station-id-S1"></circle>
        </g>
      </g>

      <g id="station_S3" data-name="station" data-station-id="S3">
        <g id="label-en-275" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(660.51 930.95)" fontSize="6" fill="#424143">Chong Nonsi</text> </g>
        <g id="label-th-275" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(672.29 930.95)" fontSize="6" fill="#424143">ช่องนนทรี</text> </g>
        <g id="station-path-275" data-name="station-path">
          <circle cx="703.7" cy="929.04" r="3.4" fill="#fff" stroke="#046461" strokeWidth="1.6" className="station-id-S3"></circle>
        </g>
      </g>
      <g id="station_S4" data-name="station" data-station-id="S4">
        <g id="label-en-276" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(647.66 967.23)" fontSize="6" fill="#424143">Saint Louis</text> </g>
        <g id="label-th-276" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(641.25 967.23)" fontSize="6" fill="#424143">เซนต์หลุยส์</text> </g>
        <g id="station-path-276" data-name="station-path">
          <circle cx="687.29" cy="966.22" r="3.4" fill="#fff" stroke="#046461" strokeWidth="1.6" className="station-id-S4"></circle>
        </g>
      </g>
      <g id="station_S5" data-name="station" data-station-id="S5">
        <g id="label-en-277" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(634.79 989.33)" fontSize="6" fill="#424143">Surasak</text> </g>
        <g id="label-th-277" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(638.08 989.33)" fontSize="6" fill="#424143">สุรศักดิ์</text> </g>
        <g id="station-path-277" data-name="station-path">
          <circle cx="664.57" cy="988.75" r="3.4" fill="#fff" stroke="#046461" strokeWidth="1.6" className="station-id-S5"></circle>
        </g>
      </g>
      <g id="station_S6" data-name="station" data-station-id="S6">
        <g id="label-en-278" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(615.65 1015.65)" fontSize="6" fill="#424143">Saphan Taksin</text> </g>
        <g id="label-th-278" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(609.79 1015.65)" fontSize="6" fill="#424143">สะพานตากสิน</text> </g>
        <g id="station-path-278" data-name="station-path">
          <circle cx="624.01" cy="1003.04" r="3.4" fill="#fff" stroke="#046461" strokeWidth="1.6" className="station-id-S6"></circle>
        </g>
      </g>

      <g id="station_S8" data-name="station" data-station-id="S8">
        <g id="label-en-280" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(517.82 1015.65)" fontSize="6" fill="#424143">Wongwian Yai</text> </g>
        <g id="label-th-280" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(521.72 1015.65)" fontSize="6" fill="#424143">วงเวียนใหญ่</text> </g>
        <g id="station-path-280" data-name="station-path">
          <circle cx="533.78" cy="1003.04" r="3.4" fill="#fff" stroke="#046461" strokeWidth="1.6" className="station-id-S8"></circle>
        </g>
      </g>
      <g id="station_S9" data-name="station" data-station-id="S9">
        <g id="label-en-281" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(474.82 1015.65)" fontSize="6" fill="#424143">Pho Nimit</text> </g>
        <g id="label-th-281" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(476.15 1015.65)" fontSize="6" fill="#424143">โพธิ์นิมิตร</text> </g>
        <g id="station-path-281" data-name="station-path">
          <circle cx="486.19" cy="1003.04" r="3.4" fill="#fff" stroke="#046461" strokeWidth="1.6" className="station-id-S9"></circle>
        </g>
      </g>
      <g id="station_S10" data-name="station" data-station-id="S10">
        <g id="label-en-282" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(431.02 1015.71)" fontSize="6" fill="#424143">Talat Phlu</text> </g>
        <g id="label-th-282" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(432.17 1015.71)" fontSize="6" fill="#424143">ตลาดพลู</text> </g>
        <g id="station-path-282" data-name="station-path">
          <circle cx="443.01" cy="1003.04" r="3.4" fill="#fff" stroke="#046461" strokeWidth="1.6" className="station-id-S10"></circle>
        </g>
      </g>
      <g id="station_S11" data-name="station" data-station-id="S11">
        <g id="label-en-283" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(386.61 965.5)" fontSize="6" fill="#424143">Wutthakat</text> </g>
        <g id="label-th-283" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(386.61 965.5)" fontSize="6" fill="#424143">วุฒากาศ</text> </g>
        <g id="station-path-283" data-name="station-path">
          <circle cx="384.89" cy="973.78" r="3.4" fill="#fff" stroke="#046461" strokeWidth="1.6" className="station-id-S11"></circle>
        </g>
      </g>

    </g>
    <g id="bts-sukhumvit" data-name="train-line">


      <g data-status="open">
        <g id="track-14" data-name="track">
          <path id="Line-22" d="M870.25 138.21H811.39C809.6 138.209 807.828 138.562 806.176 139.249C804.523 139.935 803.022 140.942 801.76 142.21L679.38 265.49C676.857 268.032 675.441 271.468 675.44 275.05V798.44C675.453 802.033 676.888 805.475 679.43 808.014C681.973 810.553 685.417 811.982 689.01 811.99H915.42C919.02 812 922.469 813.439 925.01 815.99L1032.88 923.89C1035.43 926.435 1036.87 929.887 1036.88 933.49V1278.32C1036.88 1281.92 1038.31 1285.37 1040.85 1287.91C1043.39 1290.46 1046.84 1291.89 1050.44 1291.89H1070.5" stroke="#69a543" strokeWidth="4" strokeMiterlimit="10"></path>
        </g>
        <g id="station_N24" data-name="station" data-station-id="N24">
          <g id="label-en-293" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(860 129)" fontSize="6" fill="#424143">Khu Khot</text> </g>
          <g id="label-th-293" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(860 129)" fontSize="6" fill="#424143">คูคต</text> </g>
          <g id="station-path-293" data-name="station-path">
            <circle cx="871.22" cy="138.19" r="3.4" fill="#fff" stroke="#69a543" strokeWidth="1.6" className="station-id-N24"></circle>
          </g>
        </g>
        <g id="station_N23" data-name="station" data-station-id="N23">
          <g id="label-en-294" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(793 129)" fontSize="6" fill="#424143">Kor Por Aor Junction</text> </g>
          <g id="label-th-294" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(817.21 129)" fontSize="6" fill="#424143">แยกคปอ.</text> </g>
          <g id="station-path-294" data-name="station-path">
            <circle cx="828.26" cy="138.19" r="3.4" fill="#fff" stroke="#69a543" strokeWidth="1.6" className="station-id-N23"></circle>
          </g>
        </g>
        <g id="station_N22" data-name="station" data-station-id="N22">
          <g id="label-en-295" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(695 158.5)" fontSize="6" fill="#424143">Royal Thai Air Force Museum</text> </g>
          <g id="label-th-295" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(716.7 157.5)" fontSize="6" fill="#424143">พิพิธภัณฑ์กองทัพอากาศ</text> </g>
          <g id="station-path-295" data-name="station-path">
            <circle cx="787.6" cy="156.45" r="3.4" fill="#fff" stroke="#69a543" strokeWidth="1.6" className="station-id-N22"></circle>
          </g>
        </g>
        <g id="station_N21" data-name="station" data-station-id="N21">
          <g id="label-en-296" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(674 180.5)" fontSize="6" fill="#424143">Bhumibol Adulyadej Hospital</text> </g>
          <g id="label-th-296" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(707.9 179.5)" fontSize="6" fill="#424143">รพ.ภูมิพลอดุลยเดช</text> </g>
          <g id="station-path-296" data-name="station-path">
            <circle cx="766.02" cy="178.19" r="3.4" fill="#fff" stroke="#69a543" strokeWidth="1.6" className="station-id-N21"></circle>
          </g>
        </g>
        <g id="station_N20" data-name="station" data-station-id="N20">
          <g id="label-en-297" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(700 202.5)" fontSize="6" fill="#424143">Saphan Mai</text> </g>
          <g id="label-th-297" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(708.94 201.5)" fontSize="6" fill="#424143">สะพานใหม่</text> </g>
          <g id="station-path-297" data-name="station-path">
            <circle cx="743.53" cy="200.88" r="3.4" fill="#fff" stroke="#69a543" strokeWidth="1.6" className="station-id-N20"></circle>
          </g>
        </g>
        <g id="station_N19" data-name="station" data-station-id="N19">
          <g id="label-en-298" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(692 222.5)" fontSize="6" fill="#424143">Sai Yud</text> </g>
          <g id="label-th-298" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(693.24 222.5)" fontSize="6" fill="#424143">สายหยุด</text> </g>
          <g id="station-path-298" data-name="station-path">
            <circle cx="723.19" cy="221.37" r="3.4" fill="#fff" stroke="#69a543" strokeWidth="1.6" className="station-id-N19"></circle>
          </g>
        </g>
        <g id="station_N18" data-name="station" data-station-id="N18">
          <g id="label-en-299" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(643 243.5)" fontSize="6" fill="#424143">Phahon Yothin 59</text> </g>
          <g id="label-th-299" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(660.85 243.5)" fontSize="6" fill="#424143">พหลโยธิน 59</text> </g>
          <g id="station-path-299" data-name="station-path">
            <circle cx="702.55" cy="241.54" r="3.4" fill="#fff" stroke="#69a543" strokeWidth="1.6" className="station-id-N18"></circle>
          </g>
        </g>

        <g id="station_N16" data-name="station" data-station-id="N16">
          <g id="label-en-301" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(604 304.3)" fontSize="6" fill="#424143">11th Infantry Regiment</text> </g>
          <g id="label-th-301" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(625 304.5)" fontSize="6" fill="#424143">กรมทหารราบที่ 11</text> </g>
          <g id="station-path-301" data-name="station-path">
            <circle cx="675.5" cy="302.46" r="3.4" fill="#fff" stroke="#69a543" strokeWidth="1.6" className="station-id-N16"></circle>
          </g>
        </g>
        <g id="station_N15" data-name="station" data-station-id="N15">
          <g id="label-en-302" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(641 337.5)" fontSize="6" fill="#424143">Bang Bua</text> </g>
          <g id="label-th-302" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(652 337.5)" fontSize="6" fill="#424143">บางบัว</text> </g>
          <g id="station-path-302" data-name="station-path">
            <circle cx="675.5" cy="335.94" r="3.4" fill="#fff" stroke="#69a543" strokeWidth="1.6" className="station-id-N15"></circle>
          </g>
        </g>
        <g id="station_N14" data-name="station" data-station-id="N14">
          <g id="label-en-303" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(597 370.5)" fontSize="6" fill="#424143">Royal Forest Department</text> </g>
          <g id="label-th-303" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(646 370.5)" fontSize="6" fill="#424143">กรมป่าไม้</text> </g>
          <g id="station-path-303" data-name="station-path">
            <circle cx="675.5" cy="368.21" r="3.4" fill="#fff" stroke="#69a543" strokeWidth="1.6" className="station-id-N14"></circle>
          </g>
        </g>
        <g id="station_N13" data-name="station" data-station-id="N13">
          <g id="label-en-304" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(610 403.5)" fontSize="6" fill="#424143">Kasetsart University</text> </g>
          <g id="label-th-304" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(646 403.5)" fontSize="6" fill="#424143">ม.เกษตร</text> </g>
          <g id="station-path-304" data-name="station-path">
            <circle cx="675.5" cy="401.3" r="3.4" fill="#fff" stroke="#69a543" strokeWidth="1.6" className="station-id-N13"></circle>
          </g>
        </g>
        <g id="station_N12" data-name="station" data-station-id="N12">
          <g id="label-en-305" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(630 430.8)" fontSize="6" fill="#424143">Sena Nikhom</text> </g>
          <g id="label-th-305" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(645 430.8)" fontSize="6" fill="#424143">เสนานิคม</text> </g>
          <g id="station-path-305" data-name="station-path">
            <circle cx="675.5" cy="429.09" r="3.4" fill="#fff" stroke="#69a543" strokeWidth="1.6" className="station-id-N12"></circle>
          </g>
        </g>
        <g id="station_N11" data-name="station" data-station-id="N11">
          <g id="label-en-306" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(630 462.5)" fontSize="6" fill="#424143">Ratchayothin</text> </g>
          <g id="label-th-306" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(649 462.5)" fontSize="6" fill="#424143">รัชโยธิน</text> </g>
          <g id="station-path-306" data-name="station-path">
            <circle cx="675.5" cy="460.73" r="3.4" fill="#fff" stroke="#69a543" strokeWidth="1.6" className="station-id-N11"></circle>
          </g>
        </g>
        <g id="station_N10" data-name="station" data-station-id="N10">
          <g id="station-path-307" data-name="station-path">
            <circle cx="675.5" cy="494.78" r="3.4" fill="#fff" stroke="#69a543" strokeWidth="1.6" className="station-id-N10"></circle>
          </g>
          <g id="label-th-307" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(639 496.5)" fontSize="6" fill="#424143">พลโยธิน 24</text> </g>
          <g id="label-en-307" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(624.14 496.5)" fontSize="6" fill="#424143">Phaholyothin 24</text> </g>
        </g>
        <g id="station_N9" data-name="station" data-station-id="N9">
          <g id="label-en-308" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(607 530.83)" fontSize="6" fill="#424143">Ladphrao Intersection</text> </g>
          <g id="label-th-308" data-name="label-th"><text textRendering="geometricPrecision" transform="translate(627 530.83)" fontSize="6" fill="#424143">ห้าแยกลาดพร้าว</text> </g>
          <g id="station-path-308" data-name="station-path">
            <circle cx="675.5" cy="529.56" r="3.4" fill="#fff" stroke="#69a543" strokeWidth="1.6" className="station-id-N9"></circle>
          </g>
        </g>

        <g id="station_N7" data-name="station" data-station-id="N7">
          <g id="label-en-310" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(683.87 600.87)" fontSize="6" fill="#424143">Saphan Khwai</text> </g>
          <g id="label-th-310" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(683.87 600.87)" fontSize="6" fill="#424143">สะพานควาย</text> </g>
          <g id="station-path-310" data-name="station-path">
            <circle cx="675.5" cy="599.11" r="3.4" fill="#fff" stroke="#69a543" strokeWidth="1.6" className="station-id-N7"></circle>
          </g>
        </g>
        <g id="station_N5" data-name="station" data-station-id="N5">
          <g id="label-en-311" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(683.99 641.49)" fontSize="6" fill="#424143">Ari</text> </g>
          <g id="label-th-311" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(683.99 641.49)" fontSize="6" fill="#424143">อารีย์</text> </g>
          <g id="station-path-311" data-name="station-path">
            <circle cx="675.5" cy="639.47" r="3.4" fill="#fff" stroke="#69a543" strokeWidth="1.6" className="station-id-N5"></circle>
          </g>
        </g>
        <g id="station_N4" data-name="station" data-station-id="N4">
          <g id="label-en-312" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(683.87 667.23)" fontSize="6" fill="#424143">Sanam Pao</text> </g>
          <g id="label-th-312" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(683.87 667.23)" fontSize="6" fill="#424143">สนามเป้า</text> </g>
          <g id="station-path-312" data-name="station-path">
            <circle cx="675.5" cy="665.05" r="3.4" fill="#fff" stroke="#69a543" strokeWidth="1.6" className="station-id-N4"></circle>
          </g>
        </g>
        <g id="station_N3" data-name="station" data-station-id="N3">
          <g id="label-en-313" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(683.87 694.47)" fontSize="6" fill="#424143">Victory Monument</text> </g>
          <g id="label-th-313" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(683.87 694.47)" fontSize="6" fill="#424143">อนุสาวรีย์ชัยสมรภูมิ</text> </g>
          <g id="station-path-313" data-name="station-path">
            <circle cx="675.5" cy="692.63" r="3.4" fill="#fff" stroke="#69a543" strokeWidth="1.6" className="station-id-N3"></circle>
          </g>
        </g>

        <g id="station_N1" data-name="station" data-station-id="N1">
          <g id="label-en-315" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(683.18 770.41)" fontSize="6" fill="#424143">Ratchathewi</text> </g>
          <g id="label-th-315" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(683.18 770.41)" fontSize="6" fill="#424143">ราชเทวี</text> </g>
          <g id="station-path-315" data-name="station-path">
            <circle cx="675.5" cy="768.68" r="3.4" fill="#fff" stroke="#69a543" strokeWidth="1.6" className="station-id-N1"></circle>
          </g>
        </g>

        <g id="station_E1" data-name="station" data-station-id="E1">
          <g id="label-en-317" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(719.08 804.31)" fontSize="6" fill="#424143">Chit Lom</text> </g>
          <g id="label-th-317" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(722.71 804.31)" fontSize="6" fill="#424143">ชิดลม</text> </g>
          <g id="station-path-317" data-name="station-path">
            <circle cx="728.53" cy="811.49" r="3.4" fill="#fff" stroke="#69a543" strokeWidth="1.6" className="station-id-E1"></circle>
          </g>
        </g>
        <g id="station_E2" data-name="station" data-station-id="E2">
          <g id="label-en-318" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(748.95 804.25)" fontSize="6" fill="#424143">Phloen Chit</text> </g>
          <g id="label-th-318" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(753.87 804.25)" fontSize="6" fill="#424143">เพลินจิต</text> </g>
          <g id="station-path-318" data-name="station-path">
            <circle cx="763.82" cy="811.49" r="3.4" fill="#fff" stroke="#69a543" strokeWidth="1.6" className="station-id-E2"></circle>
          </g>
        </g>
        <g id="station_E3" data-name="station" data-station-id="E3">
          <g id="label-en-319" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(792.97 804.19)" fontSize="6" fill="#424143">Nana</text> </g>
          <g id="label-th-319" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(793.2 804.19)" fontSize="6" fill="#424143">นานา</text> </g>
          <g id="station-path-319" data-name="station-path">
            <circle cx="799.5" cy="811.49" r="3.4" fill="#fff" stroke="#69a543" strokeWidth="1.6" className="station-id-E3"></circle>
          </g>
        </g>

        <g id="station_E5" data-name="station" data-station-id="E5">
          <g id="label-en-321" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(870.38 804.13)" fontSize="6" fill="#424143">Phrom Phong</text> </g>
          <g id="label-th-321" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(875.13 804.13)" fontSize="6" fill="#424143">พร้อมพงษ์</text> </g>
          <g id="station-path-321" data-name="station-path">
            <circle cx="888.01" cy="811.49" r="3.4" fill="#fff" stroke="#69a543" strokeWidth="1.6" className="station-id-E5"></circle>
          </g>
        </g>
        <g id="station_E6" data-name="station" data-station-id="E6">
          <g id="label-en-322" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(935.25 819.28)" fontSize="6" fill="#424143">Thong Lo</text> </g>
          <g id="label-th-322" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(935.25 819.28)" fontSize="6" fill="#424143">ทองหล่อ</text> </g>
          <g id="station-path-322" data-name="station-path">
            <circle cx="927.76" cy="819.28" r="3.4" fill="#fff" stroke="#69a543" strokeWidth="1.6" className="station-id-E6"></circle>
          </g>
        </g>
        <g id="station_E7" data-name="station" data-station-id="E7">
          <g id="label-en-323" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(955.6 839.63)" fontSize="6" fill="#424143">Ekkamai</text> </g>
          <g id="label-th-323" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(955.6 839.63)" fontSize="6" fill="#424143">เอกมัย</text> </g>
          <g id="station-path-323" data-name="station-path">
            <circle cx="948.29" cy="839.63" r="3.4" fill="#fff" stroke="#69a543" strokeWidth="1.6" className="station-id-E7"></circle>
          </g>
        </g>
        <g id="station_E8" data-name="station" data-station-id="E8">
          <g id="label-en-324" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(982.62 865.83)" fontSize="6" fill="#424143">Pra Khanong</text> </g>
          <g id="label-th-324" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(982.62 865.83)" fontSize="6" fill="#424143">พระโขนง</text> </g>
          <g id="station-path-324" data-name="station-path">
            <circle cx="975.3" cy="866.83" r="3.4" fill="#fff" stroke="#69a543" strokeWidth="1.6" className="station-id-E8"></circle>
          </g>
        </g>
        <g id="station_E9" data-name="station" data-station-id="E9">
          <g id="label-en-325" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(1007.68 889.9)" fontSize="6" fill="#424143">On Nut</text> </g>
          <g id="label-th-325" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(1007.68 889.9)" fontSize="6" fill="#424143">อ่อนนุช</text> </g>
          <g id="station-path-325" data-name="station-path">
            <circle cx="1000.37" cy="890.9" r="3.4" fill="#fff" stroke="#69a543" strokeWidth="1.6" className="station-id-E9"></circle>
          </g>
        </g>
        <g id="station_E10" data-name="station" data-station-id="E10">
          <g id="label-en-326" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(1029.86 912.08)" fontSize="6" fill="#424143">Bang Chak</text> </g>
          <g id="label-th-326" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(1029.86 912.08)" fontSize="6" fill="#424143">บางจาก</text> </g>
          <g id="station-path-326" data-name="station-path">
            <circle cx="1022.55" cy="913.08" r="3.4" fill="#fff" stroke="#69a543" strokeWidth="1.6" className="station-id-E10"></circle>
          </g>
        </g>
        <g id="station_E11" data-name="station" data-station-id="E11">
          <g id="label-en-327" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(1043.96 944.41)" fontSize="6" fill="#424143">Punnawithi</text> </g>
          <g id="label-th-327" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(1043.96 944.41)" fontSize="6" fill="#424143">ปุณณวิถี</text> </g>
          <g id="station-path-327" data-name="station-path">
            <circle cx="1037" cy="942.5" r="3.4" fill="#fff" stroke="#69a543" strokeWidth="1.6" className="station-id-E11"></circle>
          </g>
        </g>
        <g id="station_E12" data-name="station" data-station-id="E12">
          <g id="label-en-328" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(1043.96 974.55)" fontSize="6" fill="#424143">Udom Suk</text> </g>
          <g id="label-th-328" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(1043.96 974.55)" fontSize="6" fill="#424143">อุดมสุข</text> </g>
          <g id="station-path-328" data-name="station-path">
            <circle cx="1037" cy="973.5" r="3.4" fill="#fff" stroke="#69a543" strokeWidth="1.6" className="station-id-E12"></circle>
          </g>
        </g>
        <g id="station_E13" data-name="station" data-station-id="E13">
          <g id="station-path-329" data-name="station-path">
            <circle cx="1037" cy="1006.5" r="3.4" fill="#fff" stroke="#69a543" strokeWidth="1.6" className="station-id-E13"></circle>
          </g>
          <g id="label-en-329" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(1043.96 1008.46)" fontSize="6" fill="#424143">Bang Na</text> </g>
          <g id="label-th-329" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(1043.96 1008.46)" fontSize="6" fill="#424143">บางนา</text> </g>
        </g>
        <g id="station_E14" data-name="station" data-station-id="E14">
          <g id="label-en-330" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(1043.96 1040.37)" fontSize="6" fill="#424143">Bearing </text> </g>
          <g id="label-th-330" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(1043.96 1040.98)" fontSize="6" fill="#424143">แบริ่ง</text> </g>
          <g id="station-path-330" data-name="station-path">
            <circle cx="1037" cy="1039.46" r="3.4" fill="#fff" stroke="#69a543" strokeWidth="1.6" className="station-id-E14"></circle>
          </g>
        </g>

        <g id="station_E16" data-name="station" data-station-id="E16">
          <g id="station-path-332" data-name="station-path">
            <circle cx="1037" cy="1091.46" r="3.4" fill="#fff" stroke="#69a543" strokeWidth="1.6" className="station-id-E16"></circle>
          </g>
          <g id="label-en-332" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(1043.96 1092.67)" fontSize="6" fill="#424143">Pu Chao</text> </g>
          <g id="label-th-332" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(1043.96 1092.67)" fontSize="6" fill="#424143">ปู่เจ้า</text> </g>
        </g>
        <g id="station_E17" data-name="station" data-station-id="E17">
          <g id="label-en-333" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(1043.96 1119.8)" fontSize="6" fill="#424143">Chang Erawan</text> </g>
          <g id="label-th-333" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(1043.96 1119.8)" fontSize="6" fill="#424143">ช้างเอราวัณ</text> </g>
          <g id="station-path-333" data-name="station-path">
            <circle cx="1037" cy="1117.77" r="3.4" fill="#fff" stroke="#69a543" strokeWidth="1.6" className="station-id-E17"></circle>
          </g>
        </g>
        <g id="station_E18" data-name="station" data-station-id="E18">
          <g id="label-en-334" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(1043.91 1150.91)" fontSize="6" fill="#424143">Royal Thai Naval Academy</text> </g>
          <g id="label-th-334" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(1044.01 1150.91)" fontSize="6" fill="#424143">โรงเรียนนายเรือ</text> </g>
          <g id="station-path-334" data-name="station-path">
            <circle cx="1037" cy="1148.77" r="3.4" fill="#fff" stroke="#69a543" strokeWidth="1.6" className="station-id-E18"></circle>
          </g>
        </g>
        <g id="station_E19" data-name="station" data-station-id="E19">
          <g id="label-en-335" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(1043.96 1179.63)" fontSize="6" fill="#424143">Pak Nam</text> </g>
          <g id="label-th-335" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(1043.96 1179.63)" fontSize="6" fill="#424143">ปากน้ำ</text> </g>
          <g id="station-path-335" data-name="station-path">
            <circle cx="1037" cy="1177.77" r="3.4" fill="#fff" stroke="#69a543" strokeWidth="1.6" className="station-id-E19"></circle>
          </g>
        </g>
        <g id="station_E20" data-name="station" data-station-id="E20">
          <g id="label-en-336" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(1043.96 1209.93)" fontSize="6" fill="#424143">Srinagarindra</text> </g>
          <g id="label-th-336" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(1043.96 1209.93)" fontSize="6" fill="#424143">ศรีนครินทร์</text> </g>
          <g id="station-path-336" data-name="station-path">
            <circle cx="1037" cy="1207.77" r="3.4" fill="#fff" stroke="#69a543" strokeWidth="1.6" className="station-id-E20"></circle>
          </g>
        </g>
        <g id="station_E21" data-name="station" data-station-id="E21">
          <g id="label-en-337" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(1043.96 1239.46)" fontSize="6" fill="#424143">Phraek Sa</text> </g>
          <g id="label-th-337" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(1043.96 1239.46)" fontSize="6" fill="#424143">แพรกษา</text> </g>
          <g id="station-path-337" data-name="station-path">
            <circle cx="1036.86" cy="1238.25" r="3.4" fill="#fff" stroke="#69a543" strokeWidth="1.6" className="station-id-E21"></circle>
          </g>
        </g>
        <g id="station_E22" data-name="station" data-station-id="E22">
          <g id="label-en-338" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(1043.96 1270)" fontSize="6" fill="#424143">Sai Luat</text> </g>
          <g id="label-th-338" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(1043.96 1270)" fontSize="6" fill="#424143">สายลวด</text> </g>
          <g id="station-path-338" data-name="station-path">
            <circle cx="1037.15" cy="1268.17" r="3.4" fill="#fff" stroke="#69a543" strokeWidth="1.6" className="station-id-E22"></circle>
          </g>
        </g>
        <g id="station_E23" data-name="station" data-station-id="E23">
          <g id="label-en-339" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(1062.78 1283.68)" fontSize="6" fill="#424143">Kheha</text> </g>
          <g id="label-th-339" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(1064.11 1283.68)" fontSize="6" fill="#424143">เคหะฯ</text> </g>
          <g id="station-path-339" data-name="station-path">
            <circle cx="1071" cy="1291.48" r="3.4" fill="#fff" stroke="#69a543" strokeWidth="1.6" className="station-id-E23"></circle>
          </g>
        </g>
      </g>
    </g>
    <g id="airport-link" data-name="train-line">

      <g data-status="open">
        <g id="track-18" data-name="track">
          <path id="Line-12" d="M701.19,781.77l596.32-.25a3,3,0,0,1,3,3v31.85" transform="translate(-25.75 -52.38)" fill="none" stroke="#B21617" strokeMiterlimit="10" strokeWidth="4"></path>
        </g>
        <g id="station_A1" data-name="station" data-station-id="A1">
          <g id="label-en-343" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(1283.45 763.73)" fontSize="6" fill="#424143">Suvarnnabhumi</text> </g>
          <g id="label-th-343" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(1283.45 763.73)" fontSize="6" fill="#424143">สุวรรณภูมิ</text> </g>
          <g id="station-path-343" data-name="station-path">
            <circle cx="1274.73" cy="762.52" r="3.4" fill="#fff" stroke="#B21617" strokeWidth="1.6" className="station-id-A1"></circle>
          </g>
          <g id="suvarnnabhumi-airport" data-name="airport" transform="translate(1263.45 768)">
            <path fillRule="evenodd" clipRule="evenodd" d="M2.43668 15.4907C2.43814 14.9003 2.77359 14.3232 3.31998 13.6772L0.160311 11.6792C-0.0389073 11.5927 -0.0345127 11.4711 0.0812099 11.3276L0.750644 10.7563C0.872226 10.6816 1.00113 10.6494 1.14029 10.6875L5.03971 11.3466L8.28873 7.82808L0.703769 2.69673C0.511874 2.58394 0.495761 2.4565 0.693515 2.30855L1.78775 1.4355L11.6754 4.21431L14.5963 1.09126C15.5763 0.243116 16.5285 -0.136278 17.2594 0.0438976C17.6623 0.143507 17.8044 0.263624 17.9289 0.641554C18.1706 1.38276 17.7956 2.37886 16.9093 3.40425L13.7863 6.32515L16.5651 16.2128L15.6921 17.3071C15.5441 17.5034 15.4167 17.4873 15.3039 17.2968L10.1711 9.71333L6.6525 12.9609L7.31168 16.8603C7.34976 16.998 7.319 17.1269 7.24283 17.25L6.67154 17.9194C6.52945 18.0351 6.40641 18.0395 6.31998 17.8403L4.32193 14.6806C3.67301 15.2285 3.09586 15.5639 2.5026 15.5639C2.4484 15.5625 2.43668 15.5434 2.43668 15.4907Z" fill="#424143"></path>
          </g>
        </g>
        <g id="station_A2" data-name="station" data-station-id="A2">
          <g id="label-en-344" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(1222.81 720.64)" fontSize="6" fill="#424143">Lat Krabang</text> </g>
          <g id="label-th-344" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(1225.94 720.64)" fontSize="6" fill="#424143">ลาดกระบัง</text> </g>
          <g id="station-path-344" data-name="station-path">
            <circle cx="1236.52" cy="729.15" r="3.4" fill="#fff" stroke="#B21617" strokeWidth="1.6" className="station-id-A2"></circle>
          </g>
        </g>
        <g id="station_A3" data-name="station" data-station-id="A3">
          <g id="label-en-345" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(1171.22 720.64)" fontSize="6" fill="#424143">Ban Thap Chang</text> </g>
          <g id="label-th-345" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(1178.94 720.64)" fontSize="6" fill="#424143">บ้านทับช้าง</text> </g>
          <g id="station-path-345" data-name="station-path">
            <circle cx="1189.86" cy="729.15" r="3.4" fill="#fff" stroke="#B21617" strokeWidth="1.6" className="station-id-A3"></circle>
          </g>
        </g>

        <g id="station_A5" data-name="station" data-station-id="A5">
          <g id="label-en-347" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(1022.95 721.17)" fontSize="6" fill="#424143">Ramkhamhaeng</text> </g>
          <g id="label-th-347" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(1030.7 721.17)" fontSize="6" fill="#424143">รามคำแหง</text> </g>
          <g id="station-path-347" data-name="station-path">
            <circle cx="1043.47" cy="729.19" r="3.4" fill="#fff" stroke="#B21617" strokeWidth="1.6" className="station-id-A5"></circle>
          </g>
        </g>

        <g id="station_A7" data-name="station" data-station-id="A7">
          <g id="label-en-349" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(751.47 723.17)" fontSize="6" fill="#424143">Ratchaprarop</text> </g>
          <g id="label-th-349" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(756.08 723.17)" fontSize="6" fill="#424143">ราชปรารภ</text> </g>
          <g id="station-path-349" data-name="station-path">
            <circle cx="745.29" cy="729.15" r="3.4" fill="#fff" stroke="#B21617" strokeWidth="1.6" className="station-id-A7"></circle>
          </g>
        </g>

      </g>
    </g>
    <g id="transit-stations" data-status="open">
      <g id="station_BL10" data-name="transit" data-station-id="BL10">
        <g id="label-en-214" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(517.37 604.07)" fontSize="6" fill="#424143">Tao Poon</text> </g>
        <g id="label-th-214" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(517.37 604.07)" fontSize="6" fill="#424143">เตาปูน</text> </g>
        <g data-name="platform-transit-path">
          <g data-name="platform-path">
            <rect x="506.2" y="598.6" width="9" height="17" rx="4.5" fill="white" stroke="#424143"></rect>
          </g>
          <g data-name="station-path">
            <circle className="station-id-BL10" cx="510.6" cy="611" r="2.5" fill="#0E6494"></circle>
          </g>
          <g data-name="station-path">
            <circle className="station-id-PP16" cx="510.6" cy="603.2" r="2.5" fill="#9B54A2"></circle>
          </g>
        </g>
      </g>

      <g id="station_PP15" data-name="transit" data-station-id="PP15">
        <g id="label-en-9" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(518.72 569.21)" fontSize="6" fill="#424143">Bang Son</text> </g>
        <g id="label-th-9" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(518.72 569.21)" fontSize="6" fill="#424143">บางซ่อน</text> </g>
        <g data-name="platform-transit-path">
          <g data-name="platform-path">
            <rect x="504.094" y="570.657" width="9" height="17" rx="4.5" transform="rotate(-45 504.094 570.657)" fill="white" stroke="#424143"></rect>
          </g>

          <g data-name="station-path">
            <circle className="station-id-PP15" cx="510.3" cy="570.31" r="2.5" fill="#9B54A2"></circle>
          </g>
          <g data-name="station-path">
            <circle className="station-id-RW02" cx="516.13" cy="576.67" r="2.5" fill="#F26163"></circle>
          </g>

        </g>
      </g>

      <g id="station_CEN" data-name="transit" data-station-id="CEN">
        <g id="label-en-214" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(687 804.31)" fontSize="6" fill="#424143">Siam</text> </g>
        <g id="label-th-214" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(687 804.31)" fontSize="6" fill="#424143">สยาม</text> </g>
        <g data-name="platform-transit-path">
          <g data-name="platform-path">
            <rect x="689" y="808" width="9" height="18" rx="4.5" fill="white" stroke="#424143"></rect>
          </g>
          <g data-name="station-path">
            <circle className="station-id-CEN1-1" cx="693.4" cy="812" r="2.5" fill="#69a543"></circle>
          </g>
          <g data-name="station-path">
            <circle className="station-id-CEN1-2" cx="693.4" cy="822" r="2.5" fill="#046461"></circle>
          </g>
        </g>
      </g>

      <g id="station_N2_A8" data-name="transit" data-station-id="N2">
        <g id="label-en-314" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(682.86 720.91)" fontSize="6" fill="#424143">Phaya Thai</text> </g>
        <g id="label-th-314" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(682.86 720.91)" fontSize="6" fill="#424143">พญาไท</text> </g>
        <g data-name="platform-transit-path">
          <g data-name="platform-path">
            <rect x="671" y="716.8" width="9" height="17" rx="4.5" fill="white" stroke="#424143"></rect>
          </g>
          <g data-name="station-path">
            <circle className="station-id-N2" cx="675.4" cy="721.1" r="2.5" fill="#69a543" strokeWidth="1.6"></circle>
          </g>
          <g data-name="station-path">
            <circle className="station-id-A8" cx="675.4" cy="728.9" r="2.5" fill="#B21617" strokeWidth="1.6"></circle>
          </g>
        </g>
      </g>

      <g id="station_BL21_A6" data-name="transit-separate">

        <g data-name="platform-transit-path">
          <g data-name="platform-path">
            <rect x="842.4" y="716.41" width="9" height="17" rx="4.5" fill="white" stroke="#424143"></rect>
          </g>
        </g>

        <g id="station_BL21" data-name="transit-station" data-station-id="BL21">
          <g id="label-en-225" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(854.02 714.99)" fontSize="6" fill="#424143">Phetchaburi</text> </g>
          <g id="station-path-225" data-name="station-path">


            <circle className="station-id-BL21" cx="846.9" cy="721.1" r="2.5" fill="#0e6494" strokeWidth="1.6"></circle>
          </g>
          <g id="label-th-225" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(854.02 714.99)" fontSize="6" fill="#424143">เพชรบุรี</text> </g>
        </g>
        <g id="station_A6" data-name="transit-station" data-station-id="A6">
          <g id="label-en-348" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(856.02 740.17)" fontSize="6" fill="#424143">Makkasan</text> </g>
          <g id="label-th-348" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(856.02 740.17)" fontSize="6" fill="#424143">มักกะสัน</text> </g>
          <g id="station-path-348" data-name="station-path">


            <circle className="station-id-A6" cx="846.9" cy="728.9" r="2.5" fill="#B21617" strokeWidth="1.6"></circle>
          </g>
        </g>
      </g>

      <g id="station_E4_BL22" data-name="transit-separate">

        <g data-name="platform-transit-path">
          <g data-name="platform-path">



            <rect x="834.6" y="812.16" width="9" height="17" rx="4.5" transform="rotate(-45 834.6 812.16)" fill="white" stroke="#424143"></rect>
          </g>
        </g>

        <g id="station_E4" data-name="transit-station" data-station-id="E4">
          <g id="label-en-320" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(825.82 804.19)" fontSize="6" fill="#424143">Asok</text> </g>
          <g id="label-th-320" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(825.92 804.19)" fontSize="6" fill="#424143">อโศก</text> </g>
          <g id="station-path-320" data-name="station-path">



            <circle className="station-id-E4" cx="840.79" cy="812.06" r="2.5" fill="#69a543"></circle>
          </g>
        </g>

        <g id="station_BL22" data-name="transit-station" data-station-id="BL22">
          <g id="label-en-226" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(855.23 827.86)" fontSize="6" fill="#424143">Sukhumvit</text> </g>
          <g id="label-th-226" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(855.23 827.86)" fontSize="6" fill="#424143">สุขุมวิท</text> </g>
          <g id="station-path-226" data-name="station-path">

            <circle className="station-id-BL22" cx="846.69" cy="817.86" r="2.5" fill="#0e6494"></circle>

          </g>
        </g>


      </g>

      <g id="station_S2_BL26" data-name="transit-separate">

        <g data-name="platform-transit-path">
          <g data-name="platform-path">



            <rect x="703.22" y="859.8" width="9" height="17" rx="4.5" transform="rotate(45 703.22 859.8)" fill="white" stroke="#424143"></rect>
          </g>
        </g>

        <g id="station_S2" data-name="transit-station" data-station-id="S2">
          <g id="label-en-274" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(665.39 860.86)" fontSize="6" fill="#424143">Sala Daeng</text> </g>
          <g id="label-th-274" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(673.39 860.86)" fontSize="6" fill="#424143">ศาลาแดง</text></g>
          <g id="station-path-274" data-name="station-path">


            <circle className="station-id-S2" cx="703.4" cy="865.9" r="2.5" fill="#046461"></circle>
          </g>
        </g>

        <g id="station_BL26" data-name="transit-station" data-station-id="BL26">
          <g id="label-en-230" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(678.72 883.9)" fontSize="6" fill="#424143">Si Lom</text> </g>
          <g id="label-th-230" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(682.24 883.9)" fontSize="6" fill="#424143">สีลม</text> </g>
          <g id="station-path-230" data-name="station-path">


            <circle className="station-id-BL26" cx="697.4" cy="872" r="2.5" fill="#0e6494"></circle>

          </g>
        </g>





      </g>
      <g id="station_G1_S7" data-name="transit" data-station-id="S7">
        <g id="label-en-279" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(567.29 1015.65)" fontSize="6" fill="#424143">Krung Thonburi</text> </g>
        <g id="label-th-279" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(577.4 1015.65)" fontSize="6" fill="#424143">กรุงธนบุรี</text> </g>
        <g data-name="platform-transit-path">
          <g data-name="platform-path">
            <rect x="594.82" y="990.2" width="9" height="17" rx="4.5" transform="rotate(45 594.82 990.2)" fill="white" stroke="#424143"></rect>
          </g>

          <g data-name="station-path">
            <circle className="station-id-G1" cx="594.8" cy="996.4" r="2.5" fill="#D0AB4F" strokeWidth="1.6"></circle>
          </g>
          <g data-name="station-path">
            <circle className="station-id-S7" cx="589.2" cy="1002.2" r="2.5" fill="#046461" strokeWidth="1.6"></circle>
          </g>

        </g>
      </g>

      <g id="station_S12_BL34" data-name="transit" data-station-id="BL34">
        <g id="label-en-238" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(323.4 910.25)" fontSize="6" fill="#424143">Bang Wa</text> </g>
        <g id="label-th-238" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(321.77 910.25)" fontSize="6" fill="#424143">บางหว้า</text> </g>
        <g data-name="platform-transit-path">
          <g data-name="platform-path">
            <rect x="324" y="918.36" width="9" height="17" rx="4.5" transform="rotate(-45 324 918.36)" fill="white" stroke="#424143"></rect>
          </g>


          <g data-name="station-path">
            <circle className="station-id-BL34" cx="330.21" cy="918" r="2.5" fill="#0e6494" strokeWidth="1.6"></circle>
          </g>

          <g data-name="station-path">
            <circle className="station-id-S12" cx="336" cy="924.28" r="2.5" fill="#046461" strokeWidth="1.6"></circle>
          </g>

        </g>
      </g>

      <g id="station_BL13_N8" data-name="transit-separate">

        <g data-name="platform-transit-path">
          <g data-name="platform-path">
            <rect x="656.2" y="558" width="24" height="9" rx="4.5" fill="white" stroke="#424143"></rect>
          </g>
        </g>

        <g id="station_BL13" data-name="transit-station" data-station-id="BL13">
          <g id="label-en-217" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(608.61 564.25)" fontSize="6" fill="#424143">Chatuchak Park</text> </g>
          <g id="label-th-217" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(623.5 564.25)" fontSize="6" fill="#424143">สวนจตุจักร</text> </g>
          <g id="station-path-217" data-name="station-path">


            <circle className="station-id-BL13" cx="661.1" cy="562.4" r="2.5" fill="#0E6494"></circle>


          </g>
        </g>

        <g id="station_N8" data-name="transit-station" data-station-id="N8">
          <g id="label-en-309" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(683.98 564.25)" fontSize="6" fill="#424143">Mo Chit</text> </g>
          <g id="label-th-309" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(683.98 564.25)" fontSize="6" fill="#424143">หมอชิต</text> </g>
          <g id="station-path-226" data-name="station-path">


            <circle className="station-id-N8" cx="675.1" cy="562.4" r="2.5" fill="#69a543"></circle>
          </g>
        </g>




      </g>

      <g id="station_BangSue_BL11_A9_RW01_RN01_RE01" data-name="bangsue" data-station-id="BL11">
        <g id="label-en-215" data-name="label-en">

          <text textRendering="geometricPrecision" transform="translate(600.7 600)" fontSize="6" fill="#424143">Bang Sue</text>
        </g>
        <g id="label-th-215" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(600.7 600)" fontSize="6" fill="#424143">บางซื่อ</text> </g>
        <g data-name="platform-transit-path">
          <g data-name="platform-path">
            <rect x="571" y="604" width="40" height="15" rx="7.5" fill="white" stroke="#424143"></rect>
          </g>
          <g data-name="station-path">
            <circle className="station-id-RW01" cx="580.3" cy="611" r="3.5" fill="#F26163"></circle>
          </g>
          <g data-name="station-path">

            <circle className="station-id-RN01" cx="590.8" cy="611" r="3.5" fill="#C42329"></circle>

          </g>


          <g data-name="station-path">


            <circle className="station-id-BL11" cx="600.8" cy="611" r="3.5" fill="#0e6494"></circle>
          </g>
        </g>
      </g>

      <g id="station_BL15_YL01" data-name="transit" data-station-id="BL15">
        <g id="label-en-219" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(715.7 529.94)" fontSize="6" fill="#424143">Lat Phrao</text> </g>
        <g id="label-th-219" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(715.7 529.94)" fontSize="6" fill="#424143">ลาดพร้าว</text> </g>
        <g data-name="platform-transit-path">
          <g data-name="platform-path">
            <rect x="745.4" y="519.6" width="9" height="21" rx="4.5" fill="white" stroke="#424143"></rect>
          </g>
          <g data-name="station-path">
            <circle className="station-id-BL15" cx="749.87" cy="524.15" r="2.5" fill="#FCD110"></circle>
          </g>
          <g data-name="station-path">
            <circle className="station-id-YL01" cx="749.87" cy="536.18" r="2.5" fill="#0e6494"></circle>
          </g>
        </g>
      </g>

      <g id="station_A4_YL11" data-name="transit" data-station-id="YL11">
        <g id="label-en-314" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(1108.17 719.98)" fontSize="6" fill="#424143">Hua Mak</text> </g>
        <g id="label-th-314" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(1110.17 721.98)" fontSize="6" fill="#424143">หัวหมาก</text> </g>
        <g data-name="platform-transit-path">
          <g data-name="platform-path">
            <rect x="1136.92" y="716.8" width="9" height="17" rx="4.5" fill="white" stroke="#424143"></rect>
          </g>
          <g data-name="station-path">
            <circle className="station-id-YL11" cx="1141.44" cy="721.1" r="2.5" fill="#FCD110" strokeWidth="1.6"></circle>
          </g>
          <g data-name="station-path">
            <circle className="station-id-A4" cx="1141.44" cy="728.9" r="2.5" fill="#B21617" strokeWidth="1.6"></circle>
          </g>
        </g>
      </g>

      <g id="station_E15_YL23" data-name="transit-separate">

        <g data-name="platform-transit-path">
          <g data-name="platform-path">
            <rect x="1031.4" y="1058.38" width="20" height="9" rx="4.5" fill="white" stroke="#424143"></rect>
          </g>
        </g>


        <g id="station_E15" data-name="transit-station" data-station-id="E15">
          <g id="label-en-217" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(1005.64 1065.23)" fontSize="6" fill="#424143">Samrong</text> </g>
          <g id="label-th-217" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(1014.04 1065.26)" fontSize="6" fill="#424143">สำโรง</text> </g>
          <g id="station-path-217" data-name="station-path">


            <circle className="station-id-E15" cx="1037" cy="1062.88" r="2.5" fill="#69a543"></circle>


          </g>
        </g>



        <g id="station_YL23" data-name="transit-station" data-station-id="YL23">
          <g id="label-en-309" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(1046.88 1074.28)" fontSize="6" fill="#424143">Sam rong</text> </g>
          <g id="label-th-309" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(1047.08 1052.65)" fontSize="6" fill="#424143">สำโรง</text> </g>
          <g id="station-path-226" data-name="station-path">


            <circle className="station-id-YL23" cx="1046.01" cy="1062.88" r="2.5" fill="#FCD110"></circle>
          </g>
        </g>
      </g>

      <g id="station_N17_PK16" data-name="transit" data-station-id="N17">
        <g id="label-en-300" data-name="label-en">
          <text transform="translate(684 284.5)" textRendering="geometricPrecision" fontSize="6" fill="#424143">Wat Phoa Si Maha That</text>
        </g>
        <g id="label-th-300" data-name="label-th">
          <text transform="translate(684 284.5)" textRendering="geometricPrecision" fontSize="6" fill="#424143">วัดพระศรีมหาธาตุ</text>
        </g>

        <g data-name="platform-transit-path">
          <g data-name="platform-path">
            <rect x="671" y="265.5" width="9" height="17" rx="4.5" fill="white" stroke="#424143"></rect>
          </g>

          <g data-name="station-path">
            <circle className="station-id-PK16" cx="675.5" cy="270.5" r="2.5" fill="#FFB2DD" strokeWidth="1.6"></circle>
          </g>

          <g data-name="station-path">
            <circle className="station-id-N17" cx="675.5" cy="277.5" r="2.5" fill="#69a543" strokeWidth="1.6"></circle>
          </g>
        </g>
      </g>

      <g id="station_RN06_PK14" data-name="transit" data-station-id="RN06">
        <g id="label-en-29" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(567.54 261.5)" fontSize="6" fill="#424143">Lak Si</text> </g>
        <g id="label-th-29" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(568 261.5)" fontSize="6" fill="#424143">หลักสี่</text></g>

        <g data-name="platform-transit-path">
          <g data-name="platform-path">
            <rect x="586.4" y="265.5" width="9" height="17" rx="4.5" fill="white" stroke="#424143"></rect>
          </g>

          <g data-name="station-path">
            <circle className="station-id-PK16" cx="590.9" cy="270.5" r="2.5" fill="#FFB2DD" strokeWidth="1.6"></circle>
          </g>

          <g data-name="station-path">
            <circle className="station-id-N17" cx="590.9" cy="277.5" r="2.5" fill="#C42329" strokeWidth="1.6"></circle>
          </g>
        </g>

        <g id="station_PP11_PK01" data-name="transit" data-station-id="PP11">
          <g id="label-en-178" data-name="label-en"> <text textRendering="geometricPrecision" transform="translate(387 391)" fontSize="6" fill="#424143">Nonthaburi Civic Center</text> </g>
          <g id="label-th-178" data-name="label-th"> <text textRendering="geometricPrecision" transform="translate(389 391)" fontSize="6" fill="#424143">ศูนย์ราชการนนทบุรี</text> </g>



          <g data-name="platform-transit-path">
            <g data-name="platform-path">
              <rect x="376.4" y="381.5" width="9" height="17" rx="4.5" fill="white" stroke="#424143"></rect>
            </g>

            <g data-name="station-path">
              <circle className="station-id-PK16" cx="380.9" cy="386.5" r="2.5" fill="#FFB2DD" strokeWidth="1.6"></circle>
            </g>

            <g data-name="station-path">
              <circle className="station-id-N17" cx="380.9" cy="393.5" r="2.5" fill="#9B54A2" strokeWidth="1.6"></circle>
            </g>
          </g>

        </g>
      </g></g></svg ></g ></svg >
);