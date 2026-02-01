export const TransitMapSVG = () => (
  <svg id="train-map" width="1368" height="1340" viewBox="0 0 1368 1340" version="1.1" class="css-1qmhtch"><g id="metro" class="locale-th"><svg xmlns="http://www.w3.org/2000/svg" width="1362.22" height="1306.51" fill="none" viewBox="0 0 1362.22 1306.51">
    <defs>
      <style>{`
  #river path {
    opacity: 0.6;
    stroke: #B8E5FA;
  }

  :root {
    --future-color: rgb(223 223 223 / 50%);
    --grey-line-color: #949897;
  }

  [data-status="open"] circle {
    cursor: pointer;
  }

  [data-status="open"] rect {
    cursor: pointer;
  }

  [data-status="future"] [data-name="track"] path,
  [data-status="future"] [data-name="track"] line {
    stroke: rgb(223 223 223 / 30%);
    stroke-width: 2;
  }

  [data-status="future"] text {
    display: none;
  }

  [data-status="future"] circle {
    stroke: rgb(223 223 223 / 50%);
  }

  [data-status="under-construction"] [data-name="track"] path,
  [data-status="under-construction"] [data-name="track"] line {
    stroke: rgb(223 223 223 / 30%);
    stroke-width: 2;
    /* stroke-dasharray: 4; */
  }

  [data-status="under-construction"] text {
    display: none;
  }

  [data-status="under-construction"] circle {
    stroke: rgb(223 223 223 / 50%);
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
      <path d="M236.472 107.66L236.472 408.366C236.472 410.476 237.306 412.5 238.791 413.999L461.182 638.321C462.667 639.819 463.501 641.843 463.501 643.953L463.5 900.66C463.5 905.078 467.082 908.66 471.5 908.66L549.525 908.66C551.742 908.66 553.859 909.579 555.372 911.199L640.025 1001.83C642.844 1004.85 642.902 1009.52 640.157 1012.61L601.985 1055.55C599.182 1058.71 599.309 1063.49 602.276 1066.49L685.652 1150.79C687.155 1152.3 689.203 1153.16 691.34 1153.16L723.135 1153.16C725.287 1153.16 727.349 1152.29 728.854 1150.75L815.341 1062.34C816.105 1061.56 816.702 1060.63 817.093 1059.61L833.891 1015.75C834.292 1014.7 834.911 1013.75 835.705 1012.95L878.498 970.162C881.561 967.099 886.506 967.03 889.653 970.007L979.851 1055.34C983.19 1058.5 983.187 1063.82 979.845 1066.97L916.813 1126.48C915.328 1127.88 913.363 1128.66 911.321 1128.66L804.863 1128.66C802.712 1128.66 800.652 1129.53 799.148 1131.06L779.786 1150.83C778.321 1152.32 777.5 1154.33 777.5 1156.43L777.5 1182.73C777.5 1185.48 778.921 1188.05 781.26 1189.51L799.555 1200.94C800.826 1201.74 802.295 1202.16 803.795 1202.16L911.773 1202.16C913.541 1202.16 915.26 1201.57 916.66 1200.49L975.841 1154.83C977.241 1153.75 978.96 1153.16 980.728 1153.16L986.5 1153.16C990.919 1153.16 994.5 1156.74 994.5 1161.16L994.5 1359.5" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"></path>

    </g>
    <g id="light-red-line" data-name="train-line">
      <g id="light-red-line-extension" data-status="future">
        <g id="light-red-line-extension-track" data-name="track">
          <path d="M438.51 811.78H387.25C385.563 811.782 383.944 811.121 382.74 809.94L381.32 808.55L283.64 710.17L278.59 704.95" stroke="#E0E0DF" stroke-width="2" stroke-miterlimit="10"></path>
          <path d="M112.56 704.76H278.5" stroke="#E0E0DF" stroke-width="2" stroke-miterlimit="10"></path>
          <path d="M583.2 611L582.77 733.99C582.77 734.731 582.916 735.466 583.2 736.151C583.484 736.836 583.901 737.458 584.425 737.982C584.95 738.505 585.573 738.921 586.259 739.203C586.944 739.486 587.678 739.631 588.42 739.63H1130.49" stroke="#E0E0DF" stroke-width="2" stroke-miterlimit="10"></path>
        </g>
        <g id="station_RE07" data-name="station" data-station-id="RE07">
          <g id="label-en" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1123.69 750.99)" font-size="6" fill="#424143">Hua Mak</text> </g>
          <g id="label-th" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1125.15 750.99)" font-size="6" fill="#424143">หัวหมาก</text> </g>
          <g id="station-path" data-name="station-path">
            <circle cx="1133.7" cy="739.66" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-RE07"></circle>
          </g>
        </g>
        <g id="station_RE06" data-name="station" data-station-id="RE06">
          <g id="label-en-2" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1022.23 751.62)" font-size="6" fill="#424143">Ram khamhaeng</text> </g>
          <g id="label-th-2" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1030.7 751.62)" font-size="6" fill="#424143">รามคำแหง</text> </g>
          <g id="station-path-2" data-name="station-path">
            <circle cx="1043.49" cy="739.7" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-RE06"></circle>
          </g>
        </g>
        <g id="station_RE05" data-name="station" data-station-id="RE05">
          <g id="label-en-3" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(833.73 750.99)" font-size="6" fill="#424143">Phetchaburi</text> </g>
          <g id="label-th-3" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(839.23 750.99)" font-size="6" fill="#424143">เพชรบุรี</text> </g>
          <g id="station-path-3" data-name="station-path">
            <circle cx="837.06" cy="739.66" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-RE05"></circle>
          </g>
        </g>
        <g id="station_RE04" data-name="station" data-station-id="RE04">
          <g id="label-en-4" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(683.66 748.33)" font-size="6" fill="#424143">Phaya Thai</text> </g>
          <g id="label-th-4" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(683.66 748.33)" font-size="6" fill="#424143">พญาไท</text> </g>
          <g id="station-path-4" data-name="station-path">
            <circle cx="665.5" cy="739.09" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-RE04"></circle>
          </g>
        </g>
        <g id="station_RE03" data-name="station" data-station-id="RE03">
          <g id="label-en-5" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(546.82 699.94)" font-size="6" fill="#424143">Ratchawithi</text> </g>
          <g id="label-th-5" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(560.21 699.94)" font-size="6" fill="#424143">ราชวิถี</text> </g>
          <g id="station-path-5" data-name="station-path">
            <circle cx="582.76" cy="698.73" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-RE03"></circle>
          </g>
        </g>
        <g id="station_RE02" data-name="station" data-station-id="RE02">
          <g id="label-en-6" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(553.65 658.07)" font-size="6" fill="#424143">Sam Sen</text> </g>
          <g id="label-th-6" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(558.11 658.07)" font-size="6" fill="#424143">สามเสน</text> </g>
          <g id="station-path-6" data-name="station-path">
            <circle cx="582.76" cy="656.85" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-RE02"></circle>
          </g>
        </g>

        <g id="station_RW03" data-name="station" data-station-id="RW03">
          <g id="label-en-10" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(389 589.5)" font-size="6" fill="#424143">Rama VI Bridge</text> </g>
          <g id="label-th-10" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(391.54 589.5)" font-size="6" fill="#424143">สะพานพระราม 6</text> </g>
          <g id="station-path-10" data-name="station-path">
            <circle cx="440.7" cy="588.16" r="3.4" fill="#fff" stroke="#F26163" stroke-width="1.6" class="station-id-RW03"></circle>
          </g>
        </g>
        <g id="station_RW04" data-name="station" data-station-id="RW04">
          <g id="label-en-11" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(336 632.89)" font-size="6" fill="#424143">Bang Kruai - EGAT</text> </g>
          <g id="label-th-11" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(344.83 632.89)" font-size="6" fill="#424143">บางกรวย - กฟผ.</text> </g>
          <g id="station-path-11" data-name="station-path">
            <circle cx="396.99" cy="631.55" r="3.4" fill="#fff" stroke="#F26163" stroke-width="1.6" class="station-id-RW04"></circle>
          </g>
        </g>
        <g id="station_RW07" data-name="station" data-station-id="RW07">
          <g id="label-en-14" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(208.63 697.31)" font-size="6" fill="#424143">Ban Chimpli</text> </g>
          <g id="label-th-14" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(210.99 697.31)" font-size="6" fill="#424143">บ้านฉิมพลี</text> </g>
          <g id="station-path-14" data-name="station-path">
            <circle cx="221.54" cy="704.96" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-RW07"></circle>
          </g>
        </g>
        <g id="station_RW08" data-name="station" data-station-id="RW08">
          <g id="label-en-15" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(169.05 691.81)" font-size="6" fill="#424143">Kanchana phisek</text> </g>
          <g id="label-th-15" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(164.71 696.8)" font-size="6" fill="#424143">กาญจนาภิเษก</text> </g>
          <g id="station-path-15" data-name="station-path">
            <circle cx="179.26" cy="704.96" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-RW08"></circle>
          </g>
        </g>
        <g id="station_RW09" data-name="station" data-station-id="RW09">
          <g id="label-en-16" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(137.21 691.81)" font-size="6" fill="#424143">Sala Thammason</text> </g>
          <g id="label-th-16" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(136.66 691.31)" font-size="6" fill="#424143">ศาลาธรรมสพน์</text> </g>
          <g id="station-path-16" data-name="station-path">
            <circle cx="141.99" cy="704.96" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-RW09"></circle>
          </g>
        </g>
        <g id="station_RW010" data-name="station" data-station-id="RW010">
          <g id="label-en-17" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(101.34 697.22)" font-size="6" fill="#424143">Salaya</text> </g>
          <g id="label-th-17" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(100.71 697.22)" font-size="6" fill="#424143">ศาลายา</text> </g>
          <g id="station-path-17" data-name="station-path">
            <circle cx="108.73" cy="704.96" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-RW010"></circle>
          </g>
        </g>
        <g id="station_RWS1" data-name="station" data-station-id="RWS1">
          <g id="label-en-18" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(261.72 727.31)" font-size="6" fill="#424143">Taling Chan</text> </g>
          <g id="label-th-18" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(274.02 727.31)" font-size="6" fill="#424143">ตลิ่งชัน</text> </g>
          <g id="station-path-18" data-name="station-path">
            <circle cx="297.54" cy="723.89" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-RWS1"></circle>
          </g>
        </g>
        <g id="station_RWS2" data-name="station" data-station-id="RWS2">
          <g id="label-en-19" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(292.78 756.82)" font-size="6" fill="#424143">Taling Chan District Office</text> </g>
          <g id="label-th-19" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(290.91 756.82)" font-size="6" fill="#424143">สำนักงานเขตตลิ่งชัน</text> </g>
          <g id="station-path-19" data-name="station-path">
            <circle cx="329.44" cy="755.79" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-RWS2"></circle>
          </g>
        </g>
        <g id="station_RWS3" data-name="station" data-station-id="RWS3">
          <g id="label-en-20" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(320.96 793.38)" font-size="6" fill="#424143">Bang Khun Non</text> </g>
          <g id="label-th-20" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(334.35 793.38)" font-size="6" fill="#424143">บางขุนนนท์</text> </g>
          <g id="station-path-20" data-name="station-path">
            <circle cx="365.83" cy="792.17" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-RWS3"></circle>
          </g>
        </g>
        <g id="station_RWS4" data-name="station" data-station-id="RWS4">
          <g id="label-en-21" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(435.67 803.93)" font-size="6" fill="#424143">Siriraj</text> </g>
          <g id="label-th-21" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(435.47 803.93)" font-size="6" fill="#424143">ศิิริราช</text> </g>
          <g id="station-path-21" data-name="station-path">
            <circle cx="442.2" cy="811.59" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-RWS4"></circle>
          </g>
        </g>
      </g>
      <g data-status="open">
        <g id="track">
          <path d="M278.5 704.76H321.39C322.133 704.761 322.868 704.616 323.554 704.333C324.241 704.05 324.865 703.634 325.39 703.11L450.03 578.46C450.556 577.936 451.18 577.52 451.866 577.237C452.552 576.954 453.288 576.809 454.03 576.81H577.13C578.624 576.815 580.056 577.411 581.112 578.468C582.169 579.524 582.765 580.956 582.77 582.45V611.5" stroke="#F26163" stroke-width="4" stroke-miterlimit="10"></path>
        </g>


        <g id="station_RW05" data-name="station" data-station-id="RW05">
          <g id="label-en-12" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(301 687.62)" font-size="6" fill="#424143">Bang Bamru</text> </g>
          <g id="label-th-12" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(309.5 687.62)" font-size="6" fill="#424143">บางบำหรุ</text> </g>
          <g id="station-path-12" data-name="station-path">
            <circle cx="342.11" cy="686.29" r="3.4" fill="#fff" stroke="#F26163" stroke-width="1.6" class="station-id-RW05"></circle>
          </g>
        </g>
        <g id="station_RW06" data-name="station" data-station-id="RW06">
          <g id="label-en-13" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(266.35 697.02)" font-size="6" fill="#424143">Taling Chan</text> </g>
          <g id="label-th-13" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(271.5 697.02)" font-size="6" fill="#424143">ตลิ่งชัน</text> </g>
          <g id="station-path-13" data-name="station-path">
            <circle cx="278.61" cy="704.96" r="3.4" fill="#fff" stroke="#F26163" stroke-width="1.6" class="station-id-RW06"></circle>
          </g>
        </g>
      </g>
    </g>
    <g id="dark-red-line" data-name="train-line">
      <g id="extention1" data-status="future">
        <g data-name="track">
          <path id="Vector_24_2" d="M590.4 596.5L590.93 893C590.928 894.928 590.342 896.811 589.25 898.4L537.14 974.24L383.93 974.11L111 1247.68" stroke="#E0E0DF" stroke-width="2" stroke-miterlimit="10"></path>
        </g>
        <g id="station_RS02" data-name="station" data-station-id="RS02">
          <g id="label-en-1000" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(561.34 655.83)" font-size="6" fill="#424143">Sam Sen</text> </g>
          <g id="label-th-1000" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(565.8 656.18)" font-size="6" fill="#424143">สามเสน</text> </g>
          <g id="station-path-1000" data-name="station-path">
            <circle cx="590.96" cy="659.03" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6"></circle>
          </g>
        </g>
        <g id="station_RS03" data-name="station" data-station-id="RS03">
          <g id="label-en-1001" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(554.51 697.37)" font-size="6" fill="#424143">Ratchawithi</text> </g>
          <g id="label-th-1001" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(566.9 697.72)" font-size="6" fill="#424143">ราชวิถี</text> </g>
          <g id="station-path-1001" data-name="station-path">
            <circle cx="590.96" cy="700.55" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6"></circle>
          </g>
        </g>
        <g id="station_RS04" data-name="station" data-station-id="RS04">
          <g id="label-en-1003" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(558.52 764.55)" font-size="6" fill="#424143">Yommarat</text> </g>
          <g id="label-th-1003" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(566.69 764.9)" font-size="6" fill="#424143">ยมราช</text> </g>
          <g id="station-path-1003" data-name="station-path">
            <circle cx="590.96" cy="763.3" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6"></circle>
          </g>
        </g>
        <g id="station_RS05" data-name="station" data-station-id="RS05">
          <g id="label-en-1004" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(567.93 823.26)" font-size="6" fill="#424143">Yossae</text> </g>
          <g id="label-th-1004" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(564.09 823.26)" font-size="6" fill="#424143">ยศเศ</text> </g>
          <g id="station-path-1004" data-name="station-path">
            <circle cx="590.96" cy="821.64" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6"></circle>
          </g>
        </g>
        <g id="station_RS06" data-name="station" data-station-id="RS06">
          <g id="label-en-1005" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(564.15 848.22)" font-size="6" fill="#424143">HueLamphong</text> </g>
          <g id="label-th-1005" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(562.21 850.82)" font-size="6" fill="#424143">หัวลำโพง</text> </g>
          <g id="station-path-1005" data-name="station-path">
            <circle cx="590.96" cy="853.65" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6"></circle>
          </g>
        </g>
        <g id="station_RS07" data-name="station" data-station-id="RS07">
          <g id="label-en-1006" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(518.88 953.31)" font-size="6" fill="#424143">Klong San</text> </g>
          <g id="label-th-1006" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(518.88 953.31)" font-size="6" fill="#424143">คลองสาน</text> </g>
          <g id="station-path-1006" data-name="station-path">
            <circle cx="551.49" cy="952.11" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6"></circle>
          </g>
        </g>
        <g id="station_RS08" data-name="station" data-station-id="RS08">
          <g id="label-en-1007" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(520.66 984.69)" font-size="6" fill="#424143">Wongwain Yai</text> </g>
          <g id="label-th-1007" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(524.56 984.69)" font-size="6" fill="#424143">วงเวียนใหญ่</text> </g>
          <g id="station-path-1007" data-name="station-path">
            <circle cx="519.29" cy="973.73" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6"></circle>
          </g>
        </g>
        <g id="station_RS09" data-name="station" data-station-id="RS09">
          <g id="label-en-35" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(448.12 980.74)" font-size="6" fill="#424143">Talat Phlu (North)</text> </g>
          <g id="label-th-35" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(445 980.74)" font-size="6" fill="#424143">ตลาดพลูเหนือ</text> </g>
          <g id="station-path-35" data-name="station-path">
            <circle cx="459.37" cy="974.01" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-RS09"></circle>
          </g>
        </g>
        <g id="station_RS10" data-name="station" data-station-id="RS10">
          <g id="label-en-36" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(337.68 980.73)" font-size="6" fill="#424143">Wutthakat</text> </g>
          <g id="label-th-36" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(342.99 980.75)" font-size="6" fill="#424143">วุฒากาศ</text> </g>
          <g id="station-path-36" data-name="station-path">
            <circle cx="376.28" cy="980.75" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-RS10"></circle>
          </g>
        </g>
        <g id="station_RS11" data-name="station" data-station-id="RS11">
          <g id="label-en-37" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(309.03 1005.68)" font-size="6" fill="#424143">Chom Thong</text> </g>
          <g id="label-th-37" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(320.79 1005.66)" font-size="6" fill="#424143">จอมทอง</text> </g>
          <g id="station-path-37" data-name="station-path">
            <circle cx="351.99" cy="1005.66" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-RS11"></circle>
          </g>
        </g>
        <g id="station_RS12" data-name="station" data-station-id="RS12">
          <g id="label-en-38" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(308.42 1023.77)" font-size="6" fill="#424143" letter-spacing="-0.04em">W<tspan x="5.05" y="0" letter-spacing="-0.02em">at</tspan>
            <tspan x="9.95" y="0" letter-spacing="-0.03em">S</tspan>
            <tspan x="12.95" y="0" letter-spacing="-0.02em">ai</tspan>
          </text> </g>
          <g id="label-th-38" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(310.4 1023.77)" font-size="6" fill="#424143">วัดไทร</text> </g>
          <g id="station-path-38" data-name="station-path">
            <circle cx="334.53" cy="1023.22" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-RS12"></circle>
          </g>
        </g>
        <g id="station_RS13" data-name="station" data-station-id="RS13">
          <g id="label-th-39" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(286.79 1045.24)" font-size="6" fill="#424143">วัดสิงห์</text> </g>
          <g id="label-en-39" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(281.83 1045.23)" font-size="6" fill="#424143" letter-spacing="-0.04em">W<tspan x="5.05" y="0" letter-spacing="-0.02em">at Sing </tspan></text> </g>
          <g id="station-path-39" data-name="station-path">
            <circle cx="312.85" cy="1044.94" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-RS13"></circle>
          </g>
        </g>
        <g id="station_RS14" data-name="station" data-station-id="RS14">
          <g id="label-en-40" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(258.65 1063.6)" font-size="6" fill="#424143">Bang Bon</text> </g>
          <g id="label-th-40" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(261.527 1063.6)" font-size="6" fill="#424143">บางบอน</text> </g>
          <g id="station-path-40" data-name="station-path">
            <circle cx="292.76" cy="1064.9" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-RS14"></circle>
          </g>
        </g>
        <g id="station_RS15" data-name="station" data-station-id="RS15">
          <g id="label-en-41" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(236.18 1084.77)" font-size="6" fill="#424143" letter-spacing="-0.02em">R<tspan x="3.42" y="0" letter-spacing="-0.01em">ang </tspan>
            <tspan x="13" y="0">S</tspan>
            <tspan x="16.06" y="0" letter-spacing="-0.01em">a</tspan>
            <tspan x="19.03" y="0" letter-spacing="-0.03em">k</tspan>
            <tspan x="21.89" y="0" letter-spacing="-0.01em">ae</tspan>
          </text> </g>
          <g id="label-th-41" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(243.31 1084.79)" font-size="6" fill="#424143">รางสะแก</text> </g>
          <g id="station-path-41" data-name="station-path">
            <circle cx="272.9" cy="1084.78" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-RS15"></circle>
          </g>
        </g>
        <g id="station_RS16" data-name="station" data-station-id="RS16">
          <g id="label-en-42" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(220.32 1105.12)" font-size="6" fill="#424143" letter-spacing="-0.02em">R<tspan x="3.42" y="0" letter-spacing="-0.01em">ang Pho </tspan></text> </g>
          <g id="label-th-42" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(226.18 1105.13)" font-size="6" fill="#424143">รางโพธิ์</text> </g>
          <g id="station-path-42" data-name="station-path">
            <circle cx="253.12" cy="1104.59" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-RS16"></circle>
          </g>
        </g>
        <g id="station_RS17" data-name="station" data-station-id="RS17">
          <g id="label-en-43" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(194.21 1130.91)" font-size="6" fill="#424143" letter-spacing="-0.02em">S<tspan x="3.06" y="0" letter-spacing="-0.01em">a</tspan>
            <tspan x="6.02" y="0" letter-spacing="-0.04em">m</tspan>
            <tspan x="10.58" y="0" letter-spacing="-0.06em">Y</tspan>
            <tspan x="13.63" y="0" letter-spacing="-0.01em">aek</tspan>
          </text> </g>
          <g id="label-th-43" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(197.08 1130.92)" font-size="6" fill="#424143">สามแยก</text> </g>
          <g id="station-path-43" data-name="station-path">
            <circle cx="227.29" cy="1130.33" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-RS17"></circle>
          </g>
        </g>
        <g id="station_RS18" data-name="station" data-station-id="RS18">
          <g id="label-en-44" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(169.05 1148.52)" font-size="6" fill="#424143">Ph<tspan x="6.79" y="0" letter-spacing="-0.01em">r</tspan>
            <tspan x="8.96" y="0">om Daen</tspan>
          </text> </g>
          <g id="label-th-44" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(180.04 1148.52)" font-size="6" fill="#424143">พรมแดน</text> </g>
          <g id="station-path-44" data-name="station-path">
            <circle cx="209.83" cy="1147.96" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-RS18"></circle>
          </g>
        </g>
        <g id="station_RS19" data-name="station" data-station-id="RS19">
          <g id="label-en-45" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(137.83 1169.68)" font-size="6" fill="#424143">Thung Si Thong</text> </g>
          <g id="label-th-45" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(157.33 1169.64)" font-size="6" fill="#424143">ทุ่งสีทอง</text> </g>
          <g id="station-path-45" data-name="station-path">
            <circle cx="188.14" cy="1169.65" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-RS19"></circle>
          </g>
        </g>
        <g id="station_RS20" data-name="station" data-station-id="RS20">
          <g id="label-en-46" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(114.38 1191.78)" font-size="6" fill="#424143">Bang Nam Chuet</text> </g>
          <g id="label-th-46" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(134.64 1191.74)" font-size="6" fill="#424143">บางน้ำจืด</text> </g>
          <g id="station-path-46" data-name="station-path">
            <circle cx="168.08" cy="1189.61" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-RS20"></circle>
          </g>
        </g>
        <g id="station_RS21" data-name="station" data-station-id="RS21">
          <g id="label-en-47" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(109.18 1209.94)" font-size="6" fill="#424143">Khok Khwai</text> </g>
          <g id="label-th-47" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(115.46 1209.92)" font-size="6" fill="#424143">คอกควาย</text> </g>
          <g id="station-path-47" data-name="station-path">
            <circle cx="148.19" cy="1209.49" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-RS21"></circle>
          </g>
        </g>
        <g id="station_RS22" data-name="station" data-station-id="RS22">
          <g id="label-en-48" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(98.15 1227.32)" font-size="6" fill="#424143">Ek<tspan x="6.32" y="0" letter-spacing="-0.02em">k</tspan>
            <tspan x="9.24" y="0">achai</tspan>
          </text> </g>
          <g id="label-th-48" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(105.59 1227.33)" font-size="6" fill="#424143">เอกชัย</text> </g>
          <g id="station-path-48" data-name="station-path">
            <circle cx="130.36" cy="1227.33" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-RS22"></circle>
          </g>
        </g>
        <g id="station_RS23" data-name="station" data-station-id="RS23">
          <g id="label-en-49" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(74.39 1248.81)" font-size="6" fill="#424143">Maha Chai</text> </g>
          <g id="label-th-49" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(84.55 1248.79)" font-size="6" fill="#424143">มหาชัย</text> </g>
          <g id="station-path-49" data-name="station-path">
            <circle cx="111.01" cy="1247.31" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-RS23"></circle>
          </g>
        </g>
      </g>
      <g id="extention2" data-status="future">
        <g data-name="track">
          <path d="M592 9L591 141" stroke="#E0E0DF" stroke-width="2" stroke-miterlimit="10"></path>
        </g>
        <g id="station_RN14" data-name="station" data-station-id="RN14">
          <g id="label-en-21" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(607.35 5.04)" font-size="6" fill="#424143">Thammasart University - Rangsit</text> </g>
          <g id="label-th-21" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(606.34 5.04)" font-size="6" fill="#424143">มหาวิทยาลัยธรรมศาสตร์ - รังสิต</text> </g>
          <g id="station-path-21" data-name="station-path">
            <circle cx="590.96" cy="5.81" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6"></circle>
          </g>
        </g>
        <g id="station_RN13" data-name="station" data-station-id="RN13">
          <g id="label-en-22" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(600.46 36.98)" font-size="6" fill="#424143">Chiang Rak</text> </g>
          <g id="label-th-22" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(600.46 36.98)" font-size="6" fill="#424143">เชียงราก</text> </g>
          <g id="station-path-22" data-name="station-path">
            <circle cx="590.96" cy="35.77" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-RN13"></circle>
          </g>
        </g>
        <g id="station_RN12" data-name="station" data-station-id="RN12">
          <g id="label-en-23" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(612.99 70.29)" font-size="6" fill="#424143">Bangkok University - Rangsit</text> </g>
          <g id="label-th-23" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(603.9 70.29)" font-size="6" fill="#424143">มหาวิทยาลัยกรุงเทพ - รังสิต</text> </g>
          <g id="station-path-23" data-name="station-path">
            <circle cx="590.96" cy="73.91" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-RN12"></circle>
          </g>
        </g>
        <g id="station_RN11" data-name="station" data-station-id="RN11">
          <g id="label-en-24" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(600.32 104.87)" font-size="6" fill="#424143">Khlong Neung</text> </g>
          <g id="label-th-24" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(600.32 105.22)" font-size="6" fill="#424143">คลองหนึ่ง</text> </g>
          <g id="station-path-24" data-name="station-path">
            <circle cx="590.96" cy="103.65" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-RN11"></circle>
          </g>
        </g>
      </g>
      <g data-status="open">
        <g id="track_2">
          <path d="M591 141L590.93 611" stroke="#C42329" stroke-width="4" stroke-miterlimit="10"></path>
        </g>
        <g id="station_RN10" data-name="station" data-station-id="RN10">
          <g id="label-en-25" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(600 142.5)" font-size="6" fill="#424143">Rangsit</text> </g>
          <g id="label-th-25" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(600 142.5)" font-size="6" fill="#424143">รังสิต</text> </g>
          <g id="station-path-25" data-name="station-path">
            <circle cx="590.96" cy="140.39" r="3.4" fill="#fff" stroke="#C42329" stroke-width="1.6" class="station-id-RN10"></circle>
          </g>
        </g>
        <g id="station_RN09" data-name="station" data-station-id="RN09">
          <g id="label-en-26" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(600 169.5)" font-size="6" fill="#424143">Lak Hok</text> </g>
          <g id="label-th-26" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(600 169.5)" font-size="6" fill="#424143">หลักหก</text> </g>
          <g id="station-path-26" data-name="station-path">
            <circle cx="590.96" cy="167.74" r="3.4" fill="#fff" stroke="#C42329" stroke-width="1.6" class="station-id-RN09"></circle>
          </g>
        </g>
        <g id="station_RN08" data-name="station" data-station-id="RN08">
          <g id="label-en-27" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(551 206.5)" font-size="6" fill="#424143">Don Muang</text> </g>
          <g id="label-th-27" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(559 206.5)" font-size="6" fill="#424143">ดอนเมือง</text> </g>
          <g id="station-path-27" data-name="station-path">
            <circle cx="590.96" cy="204.9" r="3.4" fill="#fff" stroke="#C42329" stroke-width="1.6" class="station-id-RN08"></circle>
          </g>
          <g id="donmuang-airport" data-name="airport" transform="translate(608.49 198.11)">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M2.43668 15.4907C2.43814 14.9003 2.77359 14.3232 3.31998 13.6772L0.160311 11.6792C-0.0389073 11.5927 -0.0345127 11.4711 0.0812099 11.3276L0.750644 10.7563C0.872226 10.6816 1.00113 10.6494 1.14029 10.6875L5.03971 11.3466L8.28873 7.82808L0.703769 2.69673C0.511874 2.58394 0.495761 2.4565 0.693515 2.30855L1.78775 1.4355L11.6754 4.21431L14.5963 1.09126C15.5763 0.243116 16.5285 -0.136278 17.2594 0.0438976C17.6623 0.143507 17.8044 0.263624 17.9289 0.641554C18.1706 1.38276 17.7956 2.37886 16.9093 3.40425L13.7863 6.32515L16.5651 16.2128L15.6921 17.3071C15.5441 17.5034 15.4167 17.4873 15.3039 17.2968L10.1711 9.71333L6.6525 12.9609L7.31168 16.8603C7.34976 16.998 7.319 17.1269 7.24283 17.25L6.67154 17.9194C6.52945 18.0351 6.40641 18.0395 6.31998 17.8403L4.32193 14.6806C3.67301 15.2285 3.09586 15.5639 2.5026 15.5639C2.4484 15.5625 2.43668 15.5434 2.43668 15.4907Z" fill="#424143"></path>
          </g>
        </g>
        <g id="station_RN07" data-name="station" data-station-id="RN07">
          <g id="label-en-28" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(566 231.5)" font-size="6" fill="#424143">Kheha</text> </g>
          <g id="label-th-28" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(562 231.5)" font-size="6" fill="#424143">การเคหะ</text> </g>
          <g id="station-path-28" data-name="station-path">
            <circle cx="590.96" cy="229.7" r="3.4" fill="#fff" stroke="#C42329" stroke-width="1.6" class="station-id-RN07"></circle>
          </g>
        </g>

        <g id="station_RN05" data-name="station" data-station-id="RN05">
          <g id="label-en-30" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(532 336.5)" font-size="6" fill="#424143">Thung Song Hong</text> </g>
          <g id="label-th-30" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(554 336.5)" font-size="6" fill="#424143">ทุ่งสองห้อง</text> </g>
          <g id="station-path-30" data-name="station-path">
            <circle cx="590.96" cy="334.9" r="3.4" fill="#fff" stroke="#C42329" stroke-width="1.6" class="station-id-RN05"></circle>
          </g>
        </g>
        <g id="station_RN04" data-name="station" data-station-id="RN04">
          <g id="label-en-31" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(553 390.5)" font-size="6" fill="#424143">Bang Khen</text> </g>
          <g id="label-th-31" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(564 390.5)" font-size="6" fill="#424143">บางเขน</text> </g>
          <g id="station-path-31" data-name="station-path">
            <circle cx="590.96" cy="388.87" r="3.4" fill="#fff" stroke="#C42329" stroke-width="1.6" class="station-id-RN04"></circle>
          </g>
        </g>
        <g id="station_RN03" data-name="station" data-station-id="RN03">
          <g id="label-en-32" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(535 462.5)" font-size="6" fill="#424143">Wat Samean Nari</text> </g>
          <g id="label-th-32" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(550 462.5)" font-size="6" fill="#424143">วัดเสมียนนารี</text> </g>
          <g id="station-path-32" data-name="station-path">
            <circle cx="590.96" cy="460.69" r="3.4" fill="#fff" stroke="#C42329" stroke-width="1.6" class="station-id-RN03"></circle>
          </g>
        </g>
        <g id="station_RN02" data-name="station" data-station-id="RN02">
          <g id="label-en-33" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(553 556.5)" font-size="6" fill="#424143">Chatuchak</text> </g>
          <g id="label-th-33" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(564.96 556.5)" font-size="6" fill="#424143">จตุจักร</text> </g>
          <g id="station-path-33" data-name="station-path">
            <circle cx="590.96" cy="554.93" r="3.4" fill="#fff" stroke="#C42329" stroke-width="1.6" class="station-id-RN02"></circle>
          </g>
        </g>

      </g>
    </g>
    <g id="grey-line" data-status="future" data-name="train-line">
      <g id="track-3" data-name="track">
        <line x1="927.93" y1="274.17" x2="927.93" y2="812.35" fill="none" stroke="#e0e0df" stroke-miterlimit="10" stroke-width="2"></line>
        <path d="M429.94,984.47l-.07,13.78a3.1,3.1,0,0,0,.85,2.17l89,95.67a3.18,3.18,0,0,0,2.32,1h107.9a3.14,3.14,0,0,1,2.24.93l78.46,78.45a3.17,3.17,0,0,0,4.47,0h0l101.13-101.1a3.18,3.18,0,0,0,0-4.43l-76.4-79.89a4.78,4.78,0,0,1-1.33-3.38V940a3.83,3.83,0,0,1,3.81-3.81h0l241.5.15a6.13,6.13,0,0,0,4.35-1.81l4.59-4.59" transform="translate(-25.75 -52.38)" fill="none" stroke="#e0e0df" stroke-miterlimit="10" stroke-width="2"></path>
      </g>
      <g id="station_GY01" data-name="station" data-station-id="GY01">
        <g id="label-en-50" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(936.75 294.72)" font-size="6" fill="#424143">Vatcharaphol</text> </g>
        <g id="label-th-50" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(936.75 294.72)" font-size="6" fill="#424143">วัชรพล</text> </g>
        <g id="station-path-50" data-name="station-path">
          <circle cx="927.76" cy="292.33" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-GY01"></circle>
        </g>
      </g>
      <g id="station_GY02" data-name="station" data-station-id="GY02">
        <g id="label-en-51" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(936.75 319.18)" font-size="6" fill="#424143">Nuan Chan</text> </g>
        <g id="label-th-51" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(936.75 319.18)" font-size="6" fill="#424143">นวลจันทร์</text> </g>
        <g id="station-path-51" data-name="station-path">
          <circle cx="927.76" cy="317.33" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-GY02"></circle>
        </g>
      </g>
      <g id="station_GY03" data-name="station" data-station-id="GY03">
        <g id="label-en-52" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(936.75 348.74)" font-size="6" fill="#424143">K<tspan x="3.38" y="0">aset Nawamin</tspan></text> </g>
        <g id="label-th-52" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(936.75 348.74)" font-size="6" fill="#424143">เกษตรนวมินทร์</text> </g>
        <g id="station-path-52" data-name="station-path">
          <circle cx="927.76" cy="347.33" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-GY03"></circle>
        </g>
      </g>
      <g id="station_GY04" data-name="station" data-station-id="GY04">
        <g id="label-en-53" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(936.75 382.48)" font-size="6" fill="#424143">Khlong Lam Chiak</text> </g>
        <g id="label-th-53" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(936.75 382.48)" font-size="6" fill="#424143">คลองลำเจียก</text> </g>
        <g id="station-path-53" data-name="station-path">
          <circle cx="927.76" cy="380.33" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-GY04"></circle>
        </g>
      </g>
      <g id="station_GY05" data-name="station" data-station-id="GY05">
        <g id="label-en-54" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(936.75 419)" font-size="6" fill="#424143">Y<tspan x="2.69" y="0">othin Pha</tspan>
          <tspan x="24.4" y="0">t</tspan>
          <tspan x="26.23" y="0">tana</tspan>
        </text> </g>
        <g id="label-th-54" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(936.85 419)" font-size="6" fill="#424143">โยธินพัฒนา</text> </g>
        <g id="station-path-54" data-name="station-path">
          <circle cx="927.76" cy="417.33" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-GY05"></circle>
        </g>
      </g>
      <g id="station_GY06" data-name="station" data-station-id="GY06">
        <g id="label-en-55" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(936.75 458.81)" font-size="6" fill="#424143">Lat Ph<tspan x="16.52" y="0">r</tspan>
          <tspan x="18.63" y="0">ao 87</tspan>
        </text> </g>
        <g id="label-th-55" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(936.75 458.81)" font-size="6" fill="#424143">ลาดพร้าว 87</text> </g>
        <g id="station-path-55" data-name="station-path">
          <circle cx="927.76" cy="457.33" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-GY06"></circle>
        </g>
      </g>
      <g id="station_GY07" data-name="station" data-station-id="GY07">
        <g id="label-en-56" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(936.75 493.78)" font-size="6" fill="#424143">S<tspan x="3.06" y="0">angkhom Songkh</tspan>
          <tspan x="47.54" y="0">r</tspan>
          <tspan x="49.66" y="0">o</tspan>
        </text> </g>
        <g id="label-th-56" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(936.75 493.78)" font-size="6" fill="#424143">สังคมสงเคราะห์</text> </g>
        <g id="station-path-56" data-name="station-path">
          <circle cx="927.76" cy="492.33" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-GY07"></circle>
        </g>
      </g>
      <g id="station_GY08" data-name="station" data-station-id="GY08">
        <g id="label-en-57" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(936.75 537.08)" font-size="6" fill="#424143">Chalong<tspan x="21.26" y="0">R</tspan>
          <tspan x="24.74" y="0">at</tspan>
        </text> </g>
        <g id="label-th-57" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(936.75 537.08)" font-size="6" fill="#424143">ฉลองรัช</text> </g>
        <g id="station-path-57" data-name="station-path">
          <circle cx="927.76" cy="535.33" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-GY08"></circle>
        </g>
      </g>
      <g id="station_GY09" data-name="station" data-station-id="GY09">
        <g id="label-en-58" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(936.75 571.98)" font-size="6" fill="#424143">Si<tspan x="4.62" y="0">W</tspan>
          <tspan x="9.79" y="0">a</tspan>
          <tspan x="12.81" y="0">r</tspan>
          <tspan x="14.92" y="0">a</tspan>
        </text> </g>
        <g id="label-th-58" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(936.75 571.98)" font-size="6" fill="#424143">ศรีวรา</text> </g>
        <g id="station-path-58" data-name="station-path">
          <circle cx="927.76" cy="569.33" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-GY09"></circle>
        </g>
      </g>
      <g id="station_GY10" data-name="station" data-station-id="GY10">
        <g id="label-en-59" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(936.75 602.38)" font-size="6" fill="#424143">Nawa Si</text> </g>
        <g id="label-th-59" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(936.75 602.38)" font-size="6" fill="#424143">นวศรี</text> </g>
        <g id="station-path-59" data-name="station-path">
          <circle cx="927.76" cy="600.33" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-GY10"></circle>
        </g>
      </g>
      <g id="station_GY11" data-name="station" data-station-id="GY11">
        <g id="label-en-60" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(936.75 636.29)" font-size="6" fill="#424143">W<tspan x="5.05" y="0">at Ph</tspan>
          <tspan x="17.88" y="0">r</tspan>
          <tspan x="19.87" y="0">a</tspan>
          <tspan x="22.78" y="0">r</tspan>
          <tspan x="24.77" y="0">am</tspan>
          <tspan x="32.35" y="0">K</tspan>
          <tspan x="35.74" y="0">ao</tspan>
        </text> </g>
        <g id="label-th-60" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(936.75 636.29)" font-size="6" fill="#424143">วัดพระราม 9</text> </g>
        <g id="station-path-60" data-name="station-path">
          <circle cx="927.76" cy="634.33" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-GY11"></circle>
        </g>
      </g>
      <g id="station_GY12" data-name="station" data-station-id="GY12">
        <g id="label-en-61" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(936.23 750.42)" font-size="6" fill="#424143">P<tspan x="3.1" y="0">etchaburi - Thong</tspan>
          <tspan x="46.23" y="0">L</tspan>
          <tspan x="49.08" y="0">o</tspan>
        </text> </g>
        <g id="label-th-61" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(936.23 750.42)" font-size="6" fill="#424143">เพชรบุรี - ทองหล่อ</text> </g>
        <g id="station-path-61" data-name="station-path">
          <circle cx="927.76" cy="748.33" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-GY12"></circle>
        </g>
      </g>
      <g id="station_GY13" data-name="station" data-station-id="GY13">
        <g id="label-en-62" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(936.23 770.88)" font-size="6" fill="#424143">Cham Chan</text> </g>
        <g id="label-th-62" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(936.23 770.88)" font-size="6" fill="#424143">แจ่มจันทร์</text> </g>
        <g id="station-path-62" data-name="station-path">
          <circle cx="927.76" cy="769.33" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-GY13"></circle>
        </g>
      </g>
      <g id="station_GY14" data-name="station" data-station-id="GY14">
        <g id="label-en-63" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(935.71 789.79)" font-size="6" fill="#424143">Thong<tspan x="16.45" y="0">L</tspan>
          <tspan x="19.48" y="0">o 10</tspan>
        </text> </g>
        <g id="label-th-63" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(935.71 789.79)" font-size="6" fill="#424143">ทองหล่อ 10</text> </g>
        <g id="station-path-63" data-name="station-path">
          <circle cx="927.76" cy="788.33" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-GY14"></circle>
        </g>
      </g>
      <g id="station_GY15" data-name="station" data-station-id="GY15">
        <g id="label-en-64" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(936.17 806.53)" font-size="6" fill="#424143">Thong<tspan x="16.45" y="0">L</tspan>
          <tspan x="19.48" y="0">o</tspan>
        </text> </g>
        <g id="label-th-64" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(936.17 806.53)" font-size="6" fill="#424143">ทองหล่อ</text> </g>
        <g id="station-path-64" data-name="station-path">
          <circle cx="927.76" cy="809.28" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-GY15"></circle>
        </g>
      </g>
      <g id="station_GY16" data-name="station" data-station-id="GY16">
        <g id="label-en-65" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(929.2 869.13)" font-size="6" fill="#424143">Ph<tspan x="6.79" y="0">r</tspan>
          <tspan x="8.9" y="0">a Khanong</tspan>
        </text> </g>
        <g id="label-th-65" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(945.01 869.37)" font-size="6" fill="#424143">พระโขนง</text> </g>
        <g id="station-path-65" data-name="station-path">
          <circle cx="967.68" cy="876.83" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-GY16"></circle>
        </g>
      </g>
      <g id="station_GY17" data-name="station" data-station-id="GY17">
        <g id="label-en-66" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(929.72 895.33)" font-size="6" fill="#424143">Ban Kluai<tspan x="24.48" y="0">T</tspan>
          <tspan x="27.43" y="0">ai</tspan>
        </text> </g>
        <g id="label-th-66" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(931.02 895.33)" font-size="6" fill="#424143">บ้านกล้วยใต้</text> </g>
        <g id="station-path-66" data-name="station-path">
          <circle cx="945.67" cy="883.59" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-GY17"></circle>
        </g>
      </g>
      <g id="station_GY18" data-name="station" data-station-id="GY18">
        <g id="label-en-67" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(897.88 876.51)" font-size="6" fill="#424143">Kluai Namthai</text> </g>
        <g id="label-th-67" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(903.21 876.51)" font-size="6" fill="#424143">กล้วยน้ำไท</text> </g>
        <g id="station-path-67" data-name="station-path">
          <circle cx="915.97" cy="883.59" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-GY18"></circle>
        </g>
      </g>
      <g id="station_GY19" data-name="station" data-station-id="GY19">
        <g id="label-en-68" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(873.86 895.27)" font-size="6" fill="#424143">K<tspan x="3.38" y="0">asem</tspan>
          <tspan x="16.34" y="0">R</tspan>
          <tspan x="19.7" y="0">at</tspan>
        </text> </g>
        <g id="label-th-68" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(871.93 895.27)" font-size="6" fill="#424143">เกษมราษฎร์</text> </g>
        <g id="station-path-68" data-name="station-path">
          <circle cx="886.39" cy="883.59" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-GY19"></circle>
        </g>
      </g>
      <g id="station_GY20" data-name="station" data-station-id="GY20">
        <g id="label-en-69" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(835.67 895.21)" font-size="6" fill="#424143">Ph<tspan x="6.79" y="0">r</tspan>
          <tspan x="8.9" y="0">a</tspan>
          <tspan x="11.92" y="0">R</tspan>
          <tspan x="15.4" y="0">am 4</tspan>
        </text> </g>
        <g id="label-th-69" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(840.44 895.21)" font-size="6" fill="#424143">พระราม 4</text> </g>
        <g id="station-path-69" data-name="station-path">
          <circle cx="850.94" cy="883.59" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-GY20"></circle>
        </g>
      </g>
      <g id="station_GY21" data-name="station" data-station-id="GY21">
        <g id="label-en-70" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(798.6 895.15)" font-size="6" fill="#424143">Khlong<tspan x="18.43" y="0">T</tspan>
          <tspan x="21.37" y="0">oei</tspan>
        </text> </g>
        <g id="label-th-70" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(801.69 895.15)" font-size="6" fill="#424143">คลองเตย</text> </g>
        <g id="station-path-70" data-name="station-path">
          <circle cx="813.13" cy="883.59" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-GY21"></circle>
        </g>
      </g>
      <g id="station_GY22" data-name="station" data-station-id="GY22">
        <g id="label-en-71" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(753.02 895.02)" font-size="6" fill="#424143">Ngam Duphli</text> </g>
        <g id="label-th-71" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(759.15 895.02)" font-size="6" fill="#424143">งามดูพลี</text> </g>
        <g id="station-path-71" data-name="station-path">
          <circle cx="769.81" cy="883.59" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-GY22"></circle>
        </g>
      </g>
      <g id="station_GY23" data-name="station" data-station-id="GY23">
        <g id="label-en-72" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(722.11 895.02)" font-size="6" fill="#424143">L<tspan x="2.84" y="0">umphini</tspan></text> </g>
        <g id="label-th-72" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(726.2 895.02)" font-size="6" fill="#424143">ลุมพินี</text> </g>
        <g id="station-path-72" data-name="station-path">
          <circle cx="733.65" cy="883.59" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-GY23"></circle>
        </g>
      </g>
      <g id="station_GY24" data-name="station" data-station-id="GY24">
        <g id="label-en-73" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(720.66 910.33)" font-size="6" fill="#424143">Suarn Plu</text> </g>
        <g id="label-th-73" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(720.66 910.33)" font-size="6" fill="#424143">สวนพลู</text> </g>
        <g id="station-path-73" data-name="station-path">
          <circle cx="712.76" cy="908.33" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-GY24"></circle>
        </g>
      </g>
      <g id="station_GY25" data-name="station" data-station-id="GY25">
        <g id="label-en-74" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(720.35 937.47)" font-size="6" fill="#424143">Chong Nonsi</text> </g>
        <g id="label-th-74" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(720.35 937.47)" font-size="6" fill="#424143">ช่องนนทรี</text> </g>
        <g id="station-path-74" data-name="station-path">
          <circle cx="712.76" cy="935.74" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-GY25"></circle>
        </g>
      </g>
      <g id="station_GY26" data-name="station" data-station-id="GY26">
        <g id="label-en-75" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(736.44 952.75)" font-size="6" fill="#424143">Na<tspan x="7.02" y="0">r</tspan>
          <tspan x="9.13" y="0">adhiwas</tspan>
        </text> </g>
        <g id="label-th-75" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(736.44 952.75)" font-size="6" fill="#424143">นราธิวาส</text> </g>
        <g id="station-path-75" data-name="station-path">
          <circle cx="727.76" cy="952.33" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-GY26"></circle>
        </g>
      </g>
      <g id="station_GY27" data-name="station" data-station-id="GY27">
        <g id="label-en-76" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(754.29 971.03)" font-size="6" fill="#424143">Nang Linchi</text> </g>
        <g id="label-th-76" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(754.29 971.03)" font-size="6" fill="#424143">นางลิ้นจี่</text> </g>
        <g id="station-path-76" data-name="station-path">
          <circle cx="744.76" cy="971.33" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-GY27"></circle>
        </g>
      </g>
      <g id="station_GY28" data-name="station" data-station-id="GY28">
        <g id="label-en-77" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(772.17 990.39)" font-size="6" fill="#424143">R<tspan x="3.42" y="0">atchada - Na</tspan>
          <tspan x="35.37" y="0">r</tspan>
          <tspan x="37.42" y="0">adhiwas</tspan>
        </text> </g>
        <g id="label-th-77" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(772.17 990.39)" font-size="6" fill="#424143">รัชดา - นราธิวาส</text> </g>
        <g id="station-path-77" data-name="station-path">
          <circle cx="762.76" cy="989.33" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-GY28"></circle>
        </g>
      </g>
      <g id="station_GY29" data-name="station" data-station-id="GY29">
        <g id="label-en-78" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(789.13 1008.78)" font-size="6" fill="#424143">Y<tspan x="2.81" y="0">ann</tspan>
          <tspan x="11.7" y="0">a</tspan>
          <tspan x="14.39" y="0">v</tspan>
          <tspan x="16.85" y="0">a</tspan>
        </text> </g>
        <g id="label-th-78" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(789.13 1008.78)" font-size="6" fill="#424143">ยานนาวา</text> </g>
        <g id="station-path-78" data-name="station-path">
          <circle cx="780.8" cy="1008.78" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-GY29"></circle>
        </g>
      </g>
      <g id="station_GY30" data-name="station" data-station-id="GY30">
        <g id="label-en-79" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(781.24 1043.1)" font-size="6" fill="#424143">Ph<tspan x="6.79" y="0">r</tspan>
          <tspan x="8.9" y="0">a</tspan>
          <tspan x="11.92" y="0">R</tspan>
          <tspan x="15.4" y="0">am 3</tspan>
        </text> </g>
        <g id="label-th-79" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(781.24 1043.1)" font-size="6" fill="#424143">พระราม 3</text> </g>
        <g id="station-path-79" data-name="station-path">
          <circle cx="772.76" cy="1040.33" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-GY30"></circle>
        </g>
      </g>
      <g id="station_GY31" data-name="station" data-station-id="GY31">
        <g id="label-en-80" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(759.76 1064.78)" font-size="6" fill="#424143">Khlong Phum</text> </g>
        <g id="label-th-80" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(759.76 1064.78)" font-size="6" fill="#424143">คลองภูมิ</text> </g>
        <g id="station-path-80" data-name="station-path">
          <circle cx="752.14" cy="1061.85" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-GY31"></circle>
        </g>
      </g>
      <g id="station_GY32" data-name="station" data-station-id="GY32">
        <g id="label-en-81" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(735.71 1089.27)" font-size="6" fill="#424143">Khlong Dan</text> </g>
        <g id="label-th-81" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(735.71 1089.27)" font-size="6" fill="#424143">คลองด่าน</text> </g>
        <g id="station-path-81" data-name="station-path">
          <circle cx="727.76" cy="1085.33" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-GY32"></circle>
        </g>
      </g>
      <g id="station_GY33" data-name="station" data-station-id="GY33">
        <g id="label-en-82" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(713.8 1110.44)" font-size="6" fill="#424143">S<tspan x="3.06" y="0">athu P</tspan>
          <tspan x="19.48" y="0">r</tspan>
          <tspan x="21.53" y="0">adit</tspan>
        </text> </g>
        <g id="label-th-82" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(713.8 1110.44)" font-size="6" fill="#424143">สาธุประดิษธ์</text> </g>
        <g id="station-path-82" data-name="station-path">
          <circle cx="704.26" cy="1108.33" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-GY33"></circle>
        </g>
      </g>
      <g id="station_GY34" data-name="station" data-station-id="GY34">
        <g id="label-en-83" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(613.96 1108.74)" font-size="6" fill="#424143">Ph<tspan x="6.79" y="0">r</tspan>
          <tspan x="8.9" y="0">a</tspan>
          <tspan x="11.92" y="0">R</tspan>
          <tspan x="15.4" y="0">am 9 Bridge</tspan>
        </text> </g>
        <g id="label-th-83" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(621.33 1108.74)" font-size="6" fill="#424143">สะพานพระราม 9</text> </g>
        <g id="station-path-83" data-name="station-path">
          <circle cx="667.69" cy="1107.22" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-GY34"></circle>
        </g>
      </g>
      <g id="station_GY35" data-name="station" data-station-id="GY35">
        <g id="label-en-84" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(653.4 1083.38)" font-size="6" fill="#424143">Cha<tspan x="9.85" y="0">r</tspan>
          <tspan x="12.02" y="0">oen</tspan>
          <tspan x="21.65" y="0">R</tspan>
          <tspan x="25.13" y="0">at</tspan>
        </text> </g>
        <g id="label-th-84" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(653.4 1083.38)" font-size="6" fill="#424143">เจริญราษฎร์</text> </g>
        <g id="station-path-84" data-name="station-path">
          <circle cx="645.12" cy="1084.39" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-GY35"></circle>
        </g>
      </g>
      <g id="station_GY36" data-name="station" data-station-id="GY36">
        <g id="label-en-85" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(633.7 1064.33)" font-size="6" fill="#424143">Cha<tspan x="9.85" y="0">r</tspan>
          <tspan x="12.02" y="0">oen Krung</tspan>
        </text> </g>
        <g id="label-th-85" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(633.7 1064.33)" font-size="6" fill="#424143">เจริญกรุง</text> </g>
        <g id="station-path-85" data-name="station-path">
          <circle cx="625.37" cy="1064.33" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-GY36"></circle>
        </g>
      </g>
      <g id="station_GY37" data-name="station" data-station-id="GY37">
        <g id="label-en-86" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(455.27 1052.65)" font-size="6" fill="#424143">Mahai<tspan x="15.63" y="0">s</tspan>
          <tspan x="18.2" y="0">awan</tspan>
        </text> </g>
        <g id="label-th-86" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(462.2 1052.65)" font-size="6" fill="#424143">มไหสวรรย์</text> </g>
        <g id="station-path-86" data-name="station-path">
          <circle cx="494.43" cy="1044.82" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-GY37"></circle>
        </g>
      </g>
      <g id="station_GY38" data-name="station" data-station-id="GY38">
        <g id="label-en-87" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(415.52 994.83)" font-size="6" fill="#424143">T<tspan x="2.65" y="0">alat Phul</tspan></text> </g>
        <g id="label-th-87" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(416.56 994.82)" font-size="6" fill="#424143">ตลาดพลู</text> </g>
        <g id="station-path-87" data-name="station-path">
          <circle cx="447.76" cy="993.81" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-GY38"></circle>
        </g>
      </g>
      <g id="station_GY39" data-name="station" data-station-id="GY39">
        <g id="label-en-88" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(371.75 935.43)" font-size="6" fill="#424143">Bang Phai</text> </g>
        <g id="label-th-88" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(382.51 935.43)" font-size="6" fill="#424143">บางไผ่</text> </g>
        <g id="station-path-88" data-name="station-path">
          <circle cx="404.12" cy="929.11" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-GY39"></circle>
        </g>
      </g>
    </g>
    <g id="brown-line" data-status="future" data-name="train-line">
      <g id="track-4" data-name="track">
        <path id="Line-7" d="M1104.42,656.37V471.22a12.32,12.32,0,0,0-3.6-8.69l-60-60a12.36,12.36,0,0,0-8.69-3.6H817.79a12.36,12.36,0,0,0-8.69,3.6L758.73,452.9a12.3,12.3,0,0,1-8.7,3.6H406.51" transform="translate(-25.75 -52.38)" fill="none" stroke="#e0e0df" stroke-miterlimit="10" stroke-width="2"></path>
      </g>
      <g id="station_BR01" data-name="station" data-station-id="BR01">
        <g id="label-en-89" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(370.41 410.72)" font-size="6" fill="#424143">Nonthaburi Civi <tspan x="40.16" y="0">c</tspan>
          <tspan x="42.86" y="0">C</tspan>
          <tspan x="46.18" y="0">enter</tspan>
        </text> </g>
        <g id="label-th-89" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(370.65 410.72)" font-size="6" fill="#424143">ศูนย์ราชการนนทบุรี</text> </g>
        <g id="station-path-89" data-name="station-path">
          <circle cx="383.12" cy="403.7" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-BR01"></circle>
        </g>
      </g>
      <g id="station_BR02" data-name="station" data-station-id="BR02">
        <g id="label-en-90" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(413.99 415.72)" font-size="6" fill="#424143">Nga<tspan x="10.37" y="0">m</tspan>
          <tspan x="15.05" y="0">W</tspan>
          <tspan x="20.28" y="0">ong </tspan>
          <tspan x="31.76" y="0">W</tspan>
          <tspan x="36.92" y="0">an 2</tspan>
        </text> </g>
        <g id="label-th-90" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(414.43 415.72)" font-size="6" fill="#424143">งามวงศ์วาน 2</text> </g>
        <g id="station-path-90" data-name="station-path">
          <circle cx="428.04" cy="403.98" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-BR02"></circle>
        </g>
      </g>
      <g id="station_BR03" data-name="station" data-station-id="BR03">
        <g id="label-en-91" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(465.31 415.72)" font-size="6" fill="#424143">Nga<tspan x="10.37" y="0">m</tspan>
          <tspan x="15.05" y="0">W</tspan>
          <tspan x="20.28" y="0">ong </tspan>
          <tspan x="31.76" y="0">W</tspan>
          <tspan x="36.92" y="0">an 18</tspan>
        </text> </g>
        <g id="label-th-91" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(464.44 415.72)" font-size="6" fill="#424143">งามวงศ์วาน 18</text> </g>
        <g id="station-path-91" data-name="station-path">
          <circle cx="479.36" cy="403.98" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-BR03"></circle>
        </g>
      </g>
      <g id="station_BR04" data-name="station" data-station-id="BR04">
        <g id="label-en-92" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(511.23 415.72)" font-size="6" fill="#424143">Chinnakhet</text> </g>
        <g id="label-th-92" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(517.44 415.72)" font-size="6" fill="#424143">ชินเขต</text> </g>
        <g id="station-path-92" data-name="station-path">
          <circle cx="524.01" cy="403.98" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-BR04"></circle>
        </g>
      </g>
      <g id="station_BR05" data-name="station" data-station-id="BR05">
        <g id="label-en-93" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(558.31 415.72)" font-size="6" fill="#424143">Bang Khen</text> </g>
        <g id="label-th-93" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(563.41 415.72)" font-size="6" fill="#424143">บางเขน</text> </g>
        <g id="station-path-93" data-name="station-path">
          <circle cx="576.69" cy="403.98" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-BR05"></circle>
        </g>
      </g>
      <g id="station_BR06" data-name="station" data-station-id="BR06">
        <g id="label-en-94" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(610.15 414.78)" font-size="6" fill="#424143">
          <tspan>K</tspan>
          <tspan x="3.5" y="0">aset Uni. Gate 2</tspan>
        </text> </g>
        <g id="label-th-94" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(615.34 414.78)" font-size="6" fill="#424143">ม.เกษตร ประตู 2</text> </g>
        <g id="station-path-94" data-name="station-path">
          <circle cx="632.26" cy="403.98" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-BR06"></circle>
        </g>
      </g>
      <g id="station_BR07" data-name="station" data-station-id="BR07">
        <g id="label-en-95" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(700.41 414.66)" font-size="6" fill="#424143">K<tspan x="3.38" y="0">aset</tspan>
          <tspan x="13.66" y="0">s</tspan>
          <tspan x="16.12" y="0">a</tspan>
          <tspan x="19.02" y="0">r</tspan>
          <tspan x="21.19" y="0">t Uni</tspan>
          <tspan x="33.05" y="0">v</tspan>
          <tspan x="35.71" y="0">ersi</tspan>
          <tspan x="44.51" y="0">t</tspan>
          <tspan x="46.46" y="0">y</tspan>
        </text> </g>
        <g id="label-th-95" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(700.41 414.78)" font-size="6" fill="#424143">ม.เกษตรศาตร์</text> </g>
        <g id="station-path-95" data-name="station-path">
          <circle cx="704.34" cy="403.98" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-BR07"></circle>
        </g>
      </g>
      <g id="station_BR08" data-name="station" data-station-id="BR08">
        <g id="label-en-96" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(750.4 389.6)" font-size="6" fill="#424143">Khong Bang<tspan x="31.95" y="0">B</tspan>
          <tspan x="35.59" y="0">ua</tspan>
        </text> </g>
        <g id="label-th-96" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(750.4 389.6)" font-size="6" fill="#424143">คลองบางบัว</text> </g>
        <g id="station-path-96" data-name="station-path">
          <circle cx="741.99" cy="391.09" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-BR08"></circle>
        </g>
      </g>
      <g id="station_BR09" data-name="station" data-station-id="BR09">
        <g id="label-en-97" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(775.29 364.97)" font-size="6" fill="#424143">P<tspan x="3.4" y="0">r</tspan>
          <tspan x="5.51" y="0">ase</tspan>
          <tspan x="14.14" y="0">r</tspan>
          <tspan x="16.43" y="0">t Manukitch - Lat Pla Khao</tspan>
        </text> </g>
        <g id="label-th-97" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(781.56 364.97)" font-size="6" fill="#424143">ประเสริฐมนูกิจ- ลาดปลาเค้า</text> </g>
        <g id="station-path-97" data-name="station-path">
          <circle cx="766.82" cy="367.45" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-BR09"></circle>
        </g>
      </g>
      <g id="station_BR10" data-name="station" data-station-id="BR10">
        <g id="label-en-98" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(802.98 333.43)" font-size="6" fill="#424143">S<tspan x="3.06" y="0">ena Niwet</tspan></text> </g>
        <g id="label-th-98" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(803.8 333.43)" font-size="6" fill="#424143">เสนานิเวศน์</text> </g>
        <g id="station-path-98" data-name="station-path">
          <circle cx="815.86" cy="346.02" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-BR10"></circle>
        </g>
      </g>
      <g id="station_BR11" data-name="station" data-station-id="BR11">
        <g id="label-en-99" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(852.4 328.43)" font-size="6" fill="#424143">
          <tspan>S</tspan>
          <tspan x="3.06" y="0">atri Wi</tspan>
          <tspan x="19.69" y="0">t</tspan>
          <tspan x="21.81" y="0">thaya 2 School</tspan>
        </text> </g>
        <g id="label-th-99" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(849.33 333.43)" font-size="6" fill="#424143">โรงเรียนสตรีวิทยา 2</text> </g>
        <g id="station-path-99" data-name="station-path">
          <circle cx="870.06" cy="346.02" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-BR11"></circle>
        </g>
      </g>
      <g id="station_BR12" data-name="station" data-station-id="BR12">
        <g id="station-path-100" data-name="station-path">
          <circle cx="921.29" cy="346.02" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-BR12"></circle>
        </g>
        <g id="label-en-100" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(903.29 333.95)" font-size="6" fill="#424143">K<tspan x="3.38" y="0">aset Nawamin</tspan></text> </g>
        <g id="label-th-100" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(905.26 333.95)" font-size="6" fill="#424143">เกษตรนวมินทร์</text> </g>
      </g>
      <g id="station_BR13" data-name="station" data-station-id="BR13">
        <g id="label-en-101" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(989.71 334.43)" font-size="6" fill="#424143">Khlong Lam Chlak</text> </g>
        <g id="label-th-101" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(996.58 334.43)" font-size="6" fill="#424143">คลองลำเจียก</text> </g>
        <g id="station-path-101" data-name="station-path">
          <circle cx="1010.59" cy="346.02" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-BR13"></circle>
        </g>
      </g>
      <g id="station_BR14" data-name="station" data-station-id="BR14">
        <g id="label-en-102" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1047.89 370.59)" font-size="6" fill="#424143">Nuanchan</text> </g>
        <g id="label-th-102" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1047.89 370.59)" font-size="6" fill="#424143">นวลจันทร์</text> </g>
        <g id="station-path-102" data-name="station-path">
          <circle cx="1039.29" cy="374.08" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-BR14"></circle>
        </g>
      </g>
      <g id="station_BR15" data-name="station" data-station-id="BR15">
        <g id="label-en-103" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1075.82 398.53)" font-size="6" fill="#424143">Nawamin Juntion</text> </g>
        <g id="label-th-103" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1075.82 398.53)" font-size="6" fill="#424143">แยกนวมินทร์</text> </g>
        <g id="station-path-103" data-name="station-path">
          <circle cx="1067.29" cy="402.01" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-BR15"></circle>
        </g>
      </g>
      <g id="station_BR16" data-name="station" data-station-id="BR16">
        <g id="label-en-104" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1087.75 445.16)" font-size="6" fill="#424143">Pho<tspan x="10.03" y="0">k</tspan>
          <tspan x="12.95" y="0">aew</tspan>
        </text> </g>
        <g id="label-th-104" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1087.86 445.16)" font-size="6" fill="#424143">โพธิ์แก้ว</text> </g>
        <g id="station-path-104" data-name="station-path">
          <circle cx="1079" cy="448.64" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-BR16"></circle>
        </g>
      </g>
      <g id="station_BR17" data-name="station" data-station-id="BR17">
        <g id="label-en-105" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1086.02 484.99)" font-size="6" fill="#424143">Inth<tspan x="10.4" y="0">r</tspan>
          <tspan x="12.51" y="0">a</tspan>
          <tspan x="15.53" y="0">r</tspan>
          <tspan x="17.65" y="0">ak</tspan>
        </text> </g>
        <g id="label-th-105" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1086.02 484.99)" font-size="6" fill="#424143">อิินทรารักษ์</text> </g>
        <g id="station-path-105" data-name="station-path">
          <circle cx="1078.76" cy="487.9" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-BR17"></circle>
        </g>
      </g>
      <g id="station_BR18" data-name="station" data-station-id="BR18">
        <g id="label-en-106" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1086.02 526.47)" font-size="6" fill="#424143">Nawaminphi<tspan x="31.96" y="0">r</tspan>
          <tspan x="34.13" y="0">om</tspan>
          <tspan x="42.17" y="0">P</tspan>
          <tspan x="45.37" y="0">ark</tspan>
        </text> </g>
        <g id="label-th-106" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1086.02 524.22)" font-size="6" fill="#424143">สวนนวมินทร์ภิรมย์</text> </g>
        <g id="station-path-106" data-name="station-path">
          <circle cx="1078.76" cy="529.95" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-BR18"></circle>
        </g>
      </g>
      <g id="station_BR19" data-name="station" data-station-id="BR19">
        <g id="label-en-107" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1086.02 561.55)" font-size="6" fill="#424143">Nationnal Housing <tspan x="49.38" y="0">A</tspan>
          <tspan x="53.08" y="0">othori</tspan>
          <tspan x="68.74" y="0">t</tspan>
          <tspan x="70.81" y="0">y</tspan>
        </text> </g>
        <g id="label-th-107" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1086.02 566.55)" font-size="6" fill="#424143">การเคหะแห่งชาติ</text> </g>
        <g id="station-path-107" data-name="station-path">
          <circle cx="1078.76" cy="570.03" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-BR19"></circle>
        </g>
      </g>
      <g id="station_BR20" data-name="station" data-station-id="BR20">
        <g id="label-en-108" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1086.4 601.2)" font-size="6" fill="#424143">La<tspan x="6.11" y="0">m</tspan>
          <tspan x="10.87" y="0">S</tspan>
          <tspan x="13.99" y="0">ali Junction</tspan>
        </text> </g>
        <g id="label-th-108" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1086.4 603.7)" font-size="6" fill="#424143">แยกลำสาลี</text> </g>
        <g id="station-path-108" data-name="station-path">
          <circle cx="1078.76" cy="605.89" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-BR20"></circle>
        </g>
      </g>
    </g>

    <g id="orange-line" data-status="under-construction" data-name="train-line">
      <g id="track-12" data-name="track">
        <path d="M1319.62,473.6,1093.26,699.53a8.65,8.65,0,0,1-6.09,2.52L779.77,702a8.61,8.61,0,0,0-8.61,8.6v109a8.6,8.6,0,0,1-8.59,8.61H610.09a8.63,8.63,0,0,0-6.17,2.6l-41.54,42.76a8.63,8.63,0,0,1-6.17,2.6h-126" transform="translate(-25.75 -52.38)" fill="none" stroke="#e0e0df" stroke-miterlimit="10" stroke-width="2"></path>
      </g>
      <g id="station_OR01" data-name="station" data-station-id="OR01">
        <g id="label-en-243" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(386.07 834.86)" font-size="6" fill="#424143">Bang Khun Non</text> </g>
        <g id="label-th-243" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(392.76 834.86)" font-size="6" fill="#424143">บางขุนนนท์</text> </g>
        <g id="station-path-243" data-name="station-path">
          <circle cx="403.95" cy="823.26" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-OR01"></circle>
        </g>
      </g>
      <g id="station_OR02" data-name="station" data-station-id="OR02">
        <g id="label-en-244" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(435.39 834.86)" font-size="6" fill="#424143">Siri<tspan x="8.29" y="0">r</tspan>
          <tspan x="10.4" y="0">aj</tspan>
        </text> </g>
        <g id="label-th-244" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(435.17 834.86)" font-size="6" fill="#424143">ศิริราช</text> </g>
        <g id="station-path-244" data-name="station-path">
          <circle cx="441.93" cy="823.26" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-OR02"></circle>
        </g>
      </g>
      <g id="station_OR03" data-name="station" data-station-id="OR03">
        <g id="label-en-245" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(465.32 830.86)" font-size="6" fill="#424143">S<tspan x="3.06" y="0">anamluang</tspan></text> </g>
        <g id="label-th-245" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(468.53 830.86)" font-size="6" fill="#424143">สนามหลวง</text> </g>
        <g id="station-path-245" data-name="station-path">
          <circle cx="479.46" cy="823.95" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-OR03"></circle>
        </g>
      </g>
      <g id="station_OR04" data-name="station" data-station-id="OR04">
        <g id="label-en-246" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(511.94 834.86)" font-size="6" fill="#424143">Phan<tspan x="13.19" y="0">F</tspan>
          <tspan x="16.25" y="0">a</tspan>
        </text> </g>
        <g id="label-th-246" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(513.7 834.86)" font-size="6" fill="#424143">ผ่านฟ้า</text> </g>
        <g id="station-path-246" data-name="station-path">
          <circle cx="521.07" cy="823.26" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-OR04"></circle>
        </g>
      </g>
      <g id="station_OR05" data-name="station" data-station-id="OR05">
        <g id="label-en-247" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(526.94 794.69)" font-size="6" fill="#424143">Lan<tspan x="9.49" y="0">L</tspan>
          <tspan x="12.46" y="0">uang</tspan>
        </text> </g>
        <g id="label-th-247" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(528.79 794.48)" font-size="6" fill="#424143">หลานหลวง</text> </g>
        <g id="station-path-247" data-name="station-path">
          <circle cx="559.13" cy="798.22" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-OR05"></circle>
        </g>
      </g>
      <g id="station_OR06" data-name="station" data-station-id="OR06">
        <g id="label-en-248" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(595.17 784.74)" font-size="6" fill="#424143">Y<tspan x="2.69" y="0">omma</tspan>
          <tspan x="17.14" y="0">r</tspan>
          <tspan x="18.9" y="0">at</tspan>
        </text> </g>
        <g id="label-th-248" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(600.09 784.74)" font-size="6" fill="#424143">ยมราช</text> </g>
        <g id="station-path-248" data-name="station-path">
          <circle cx="590.96" cy="775.48" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-OR06"></circle>
        </g>
      </g>
      <g id="station_OR07" data-name="station" data-station-id="OR07">
        <g id="label-en-249" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(636.07 786.65)" font-size="6" fill="#424143">R<tspan x="3.42" y="0">atchathawi</tspan></text> </g>
        <g id="label-th-249" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(649.86 786.65)" font-size="6" fill="#424143">ราชเทวี</text> </g>
        <g id="station-path-249" data-name="station-path">
          <circle cx="665" cy="775.48" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-OR07"></circle>
        </g>
      </g>
      <g id="station_OR08" data-name="station" data-station-id="OR08">
        <g id="label-en-250" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(754.66 766.93)" font-size="6" fill="#424143">P<tspan x="3.4" y="0">r</tspan>
          <tspan x="5.51" y="0">a</tspan>
          <tspan x="8.53" y="0">t</tspan>
          <tspan x="10.6" y="0">unam</tspan>
        </text> </g>
        <g id="label-th-250" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(754.66 766.93)" font-size="6" fill="#424143">ประตูน้ำ</text> </g>
        <g id="station-path-250" data-name="station-path">
          <circle cx="745.29" cy="770.41" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-OR08"></circle>
        </g>
      </g>
      <g id="station_OR09" data-name="station" data-station-id="OR09">
        <g id="label-en-251" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(754.66 716.9)" font-size="6" fill="#424143">R<tspan x="3.42" y="0">atshap</tspan>
          <tspan x="20.57" y="0">r</tspan>
          <tspan x="22.63" y="0">a</tspan>
          <tspan x="25.59" y="0">r</tspan>
          <tspan x="27.7" y="0">op</tspan>
        </text> </g>
        <g id="station-path-251" data-name="station-path">
          <circle cx="745.29" cy="715.69" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-OR09"></circle>
        </g>
        <g id="label-th-251" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(754.66 716.9)" font-size="6" fill="#424143">ราชปรารภ</text> </g>
      </g>
      <g id="station_OR10" data-name="station" data-station-id="OR10">
        <g id="label-en-252" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(754.66 676.11)" font-size="6" fill="#424143">Din Daeng</text> </g>
        <g id="label-th-252" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(754.66 676.11)" font-size="6" fill="#424143">ดินแดน</text> </g>
        <g id="station-path-252" data-name="station-path">
          <circle cx="745.29" cy="679.59" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-OR10"></circle>
        </g>
      </g>
      <g id="station_OR11" data-name="station" data-station-id="OR11">
        <g id="label-en-253" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(756.38 636.28)" font-size="6" fill="#424143">P<tspan x="3.4" y="0">r</tspan>
          <tspan x="5.51" y="0">acha Songkh</tspan>
          <tspan x="38.8" y="0">r</tspan>
          <tspan x="40.97" y="0">o</tspan>
        </text> </g>
        <g id="label-th-253" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(759.61 636.28)" font-size="6" fill="#424143">ประชาสงเคราะห์</text> </g>
        <g id="station-path-253" data-name="station-path">
          <circle cx="775.66" cy="649.33" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-OR11"></circle>
        </g>
      </g>
      <g id="station_OR12" data-name="station" data-station-id="OR12">
        <g id="label-en-254" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(837.82 660.42)" font-size="6" fill="#424143">Thailand <tspan x="23.65" y="0">C</tspan>
          <tspan x="27.02" y="0">ul</tspan>
          <tspan x="31.81" y="0">t</tspan>
          <tspan x="33.87" y="0">u</tspan>
          <tspan x="37.22" y="0">r</tspan>
          <tspan x="39.33" y="0">al</tspan>
          <tspan x="43.79" y="0">C</tspan>
          <tspan x="47.11" y="0">ent</tspan>
          <tspan x="55.63" y="0">r</tspan>
          <tspan x="57.8" y="0">e</tspan>
        </text> </g>
        <g id="label-th-254" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(832.2 660.42)" font-size="6" fill="#424143">ศูนย์วัฒนธรรมแห่งประเทศไทย</text> </g>
        <g id="station-path-254" data-name="station-path">
          <circle cx="847.06" cy="648.66" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-OR12"></circle>
        </g>
      </g>
      <g id="station_OR13" data-name="station" data-station-id="OR13">
        <g id="label-en-255" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(895.47 656.42)" font-size="6" fill="#424143">M<tspan x="4.75" y="0">R</tspan>
          <tspan x="8.23" y="0">T</tspan>
          <tspan x="10.98" y="0">A</tspan>
        </text> </g>
        <g id="label-th-255" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(896.45 656.42)" font-size="6" fill="#424143">รฟม.</text> </g>
        <g id="station-path-255" data-name="station-path">
          <circle cx="901.44" cy="649.33" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-OR13"></circle>
        </g>
      </g>
      <g id="station_OR14" data-name="station" data-station-id="OR14">
        <g id="label-en-256" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(925.05 660.42)" font-size="6" fill="#424143">W<tspan x="5.05" y="0">at Ph</tspan>
          <tspan x="17.88" y="0">r</tspan>
          <tspan x="19.87" y="0">a</tspan>
          <tspan x="22.78" y="0">r</tspan>
          <tspan x="24.77" y="0">am</tspan>
          <tspan x="32.35" y="0">K</tspan>
          <tspan x="35.74" y="0">ao</tspan>
        </text> </g>
        <g id="label-th-256" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(916.43 660.42)" font-size="6" fill="#424143">วัดพระราม 9</text> </g>
        <g id="station-path-256" data-name="station-path">
          <circle cx="928.93" cy="648.66" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-OR14"></circle>
        </g>
      </g>
      <g id="station_OR15" data-name="station" data-station-id="OR15">
        <g id="label-en-257" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(957.97 657.42)" font-size="6" fill="#424143">R<tspan x="3.42" y="0">am khamhaeng 12</tspan></text> </g>
        <g id="label-th-257" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(949.17 657.41)" font-size="6" fill="#424143">รามคำแหง 12</text> </g>
        <g id="station-path-257" data-name="station-path">
          <circle cx="962.84" cy="648.66" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-OR15"></circle>
        </g>
      </g>
      <g id="station_OR16" data-name="station" data-station-id="OR16">
        <g id="label-en-258" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(990.81 657.42)" font-size="6" fill="#424143">R<tspan x="3.42" y="0">am khamhaeng Uni</tspan>
          <tspan x="52.54" y="0">v</tspan>
          <tspan x="55.26" y="0">ersi</tspan>
          <tspan x="64.3" y="0">t</tspan>
          <tspan x="66.31" y="0">y</tspan>
        </text> </g>
        <g id="label-th-258" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(983.49 657.42)" font-size="6" fill="#424143">มหาวิทยาลัยรามคำแหง</text> </g>
        <g id="station-path-258" data-name="station-path">
          <circle cx="995.68" cy="650.33" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-OR16"></circle>
        </g>
      </g>
      <g id="station_OR17" data-name="station" data-station-id="OR17">
        <g id="label-en-259" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1012.87 657.42)" font-size="6" fill="#424143">Ramkhamhaeng University</text> </g>
        <g id="label-th-259" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1017.09 657.42)" font-size="6" fill="#424143">มหาวิทยาลัยรามคำแหง</text> </g>
        <g id="station-path-259" data-name="station-path">
          <circle cx="1027.76" cy="650.33" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-OR17"></circle>
        </g>
      </g>
      <g id="station_OR18" data-name="station" data-station-id="OR18">
        <g id="label-en-260" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1055.46 657.41)" font-size="6" fill="#424143">R<tspan x="3.42" y="0">am Khamhaeng 34</tspan></text> </g>
        <g id="label-th-260" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1046.67 657.42)" font-size="6" fill="#424143">รามคำแหง 34</text> </g>
        <g id="station-path-260" data-name="station-path">
          <circle cx="1060.29" cy="650.33" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-OR18"></circle>
        </g>
      </g>
      <g id="station_OR19" data-name="station" data-station-id="OR19">
        <g id="label-en-261" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1088.17 635.3)" font-size="6" fill="#424143">La<tspan x="6.11" y="0">m</tspan>
          <tspan x="10.87" y="0">S</tspan>
          <tspan x="13.99" y="0">ali Junction</tspan>
        </text> </g>
        <g id="label-th-261" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1088.17 635.31)" font-size="6" fill="#424143">แยกลำสาลี</text> </g>
        <g id="station-path-261" data-name="station-path">
          <circle cx="1077.29" cy="637.63" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-OR19"></circle>
        </g>
      </g>
      <g id="station_OR20" data-name="station" data-station-id="OR20">
        <g id="label-en-262" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1127.96 597.51)" font-size="6" fill="#424143">Si<tspan x="4.62" y="0">B</tspan>
          <tspan x="8.26" y="0">u</tspan>
          <tspan x="11.6" y="0">r</tspan>
          <tspan x="13.72" y="0">apha</tspan>
        </text> </g>
        <g id="label-th-262" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1127.96 597.51)" font-size="6" fill="#424143">ศรีบูรพา</text> </g>
        <g id="station-path-262" data-name="station-path">
          <circle cx="1119.13" cy="595.14" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-OR20"></circle>
        </g>
      </g>
      <g id="station_OR21" data-name="station" data-station-id="OR21">
        <g id="label-en-261.5" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1146.72 580.71)" font-size="6" fill="#424143">Ban Ma</text> </g>
        <g id="label-th-261.5" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1146.72 580.71)" font-size="6" fill="#424143">บ้านม้า</text> </g>
        <g id="station-path-261.5" data-name="station-path">
          <circle cx="1138.41" cy="577.31" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-OR21"></circle>
        </g>
      </g>
      <g id="station_OR22" data-name="station" data-station-id="OR22">
        <g id="label-en-264" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1164.2 562.44)" font-size="6" fill="#424143">S<tspan x="3.06" y="0">amma k on</tspan></text> </g>
        <g id="label-th-264" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1164.2 562.44)" font-size="6" fill="#424143">สัมมากร</text> </g>
        <g id="station-path-264" data-name="station-path">
          <circle cx="1156.1" cy="558.86" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-OR22"></circle>
        </g>
      </g>
      <g id="station_OR23" data-name="station" data-station-id="OR23">
        <g id="label-en-265" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1184.08 542.96)" font-size="6" fill="#424143">Nom Klao</text> </g>
        <g id="label-th-265" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1184.08 542.96)" font-size="6" fill="#424143">น้อมเกล้า</text> </g>
        <g id="station-path-265" data-name="station-path">
          <circle cx="1175.4" cy="539.56" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-OR23"></circle>
        </g>
      </g>
      <g id="station_OR24" data-name="station" data-station-id="OR24">
        <g id="label-en-266" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1208.35 519.53)" font-size="6" fill="#424143">
          <tspan>R</tspan>
          <tspan x="3.42" y="0">at Pha</tspan>
          <tspan x="19.52" y="0">t</tspan>
          <tspan x="21.64" y="0">thana</tspan>
        </text> </g>
        <g id="label-th-266" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1208.35 519.54)" font-size="6" fill="#424143">ราษฎร์พัฒนา</text> </g>
        <g id="station-path-266" data-name="station-path">
          <circle cx="1199.29" cy="516.14" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-OR24"></circle>
        </g>
      </g>
      <g id="station_OR25" data-name="station" data-station-id="OR25">
        <g id="label-en-267" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1230.49 495.99)" font-size="6" fill="#424143">W<tspan x="5.05" y="0">at Bang Pheng</tspan></text> </g>
        <g id="label-th-267" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1230.49 495.99)" font-size="6" fill="#424143">วัดบางเพ็ญ</text> </g>
        <g id="station-path-267" data-name="station-path">
          <circle cx="1222.39" cy="492.57" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-OR25"></circle>
        </g>
      </g>
      <g id="station_OR26" data-name="station" data-station-id="OR26">
        <g id="label-en-268" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1251.64 475.73)" font-size="6" fill="#424143">W<tspan x="5.05" y="0">at Bang Pheng</tspan></text> </g>
        <g id="label-th-268" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1251.64 475.73)" font-size="6" fill="#424143">วัดบางเพ็ญ</text> </g>
        <g id="station-path-268" data-name="station-path">
          <circle cx="1242.59" cy="472.33" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-OR26"></circle>
        </g>
      </g>
      <g id="station_OR27" data-name="station" data-station-id="OR27">
        <g id="label-en-269" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1276.64 448.83)" font-size="6" fill="#424143">Min<tspan x="9.58" y="0">B</tspan>
          <tspan x="13.21" y="0">uri</tspan>
        </text> </g>
        <g id="label-th-269" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1276.64 448.83)" font-size="6" fill="#424143">มีนบุรี</text> </g>
        <g id="station-path-269" data-name="station-path">
          <circle cx="1268.72" cy="446.12" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-OR27"></circle>
        </g>
      </g>
      <g id="station_OR28" data-name="station" data-station-id="OR28">
        <g id="label-en-270" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1302.17 422.65)" font-size="6" fill="#424143">SuwinthawongJunction</text> </g>
        <g id="label-th-270" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1305.45 422.65)" font-size="6" fill="#424143">แยกสุวินทวงศ์</text> </g>
        <g id="station-path-270" data-name="station-path">
          <circle cx="1293.99" cy="420.28" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-OR28"></circle>
        </g>
      </g>
    </g>
    <g id="pink-line" data-name="train-line">
      <g data-status="future">
        <line id="Line 1" x1="463" y1="178" x2="463" y2="271" stroke="#E0E0DF" stroke-width="2"></line>
        <g id="station_MT01" data-name="station" data-station-id="MT01">
          <g id="label-en-137" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(471.09 215.29)" font-size="6" fill="#424143">Impact Muang Thong Thani</text> </g>
          <g id="label-th-137" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(471.09 215.29)" font-size="6" fill="#424143">อิมแพคชาเลนเจอร์</text> </g>
          <g id="station-path-137" data-name="station-path">
            <circle cx="462.76" cy="218.77" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-MT01"></circle>
          </g>
        </g>
        <g id="station_MT02" data-name="station" data-station-id="MT02">
          <g id="label-en-138" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(471.09 171.81)" font-size="6" fill="#424143">Lake Muang Thong Thani</text> </g>
          <g id="label-th-138" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(471.09 174.02)" font-size="6" fill="#424143">ทะเลสาบเมืองทองธานี</text> </g>
          <g id="station-path-138" data-name="station-path">
            <circle cx="462.76" cy="177.51" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-MT02"></circle>
          </g>
        </g>
      </g>
      <g data-status="open">
        <g id="track-5" data-name="track">
          <g id="Line-10">
            <path d="M1285.61,488.22,1121.27,323.93a2.51,2.51,0,0,0-1.77-.73h-780a2.5,2.5,0,0,0-2.5,2.5v9.16a2.49,2.49,0,0,0,.73,1.77l68.42,68.42a2.51,2.51,0,0,1,.73,1.77q-.12,15-.25,30" transform="translate(-25.75 -52.38)" fill="none" stroke="#FFB2DD" stroke-miterlimit="10" stroke-width="4"></path>
          </g>
        </g>

        <g id="station_PK02" data-name="station" data-station-id="PK02">
          <g id="label-en-110" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(390.26 349.94)" font-size="6" fill="#424143">Khae Rai</text> </g>
          <g id="label-th-110" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(390.26 349.94)" font-size="6" fill="#424143">แคราย</text> </g>
          <g id="station-path-110" data-name="station-path">
            <circle cx="380.22" cy="351.59" r="3.4" fill="#fff" stroke="#FFB2DD" stroke-width="1.6" class="station-id-PK02"></circle>
          </g>
        </g>
        <g id="station_PK03" data-name="station" data-station-id="PK03">
          <g id="label-en-111" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(365.69 325.62)" font-size="6" fill="#424143">Sanambin Nam</text> </g>
          <g id="label-th-111" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(365.69 325.62)" font-size="6" fill="#424143">สนามบินน้ำ</text> </g>
          <g id="station-path-111" data-name="station-path">
            <circle cx="356.4" cy="328.56" r="3.4" fill="#fff" stroke="#FFB2DD" stroke-width="1.6" class="station-id-PK03"></circle>
          </g>
        </g>
        <g id="station_PK04" data-name="station" data-station-id="PK04">
          <g id="label-en-112" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(348.32 308.86)" font-size="6" fill="#424143">Samakkhi</text> </g>
          <g id="label-th-112" data-name="label-th"><text text-rendering="geometricPrecision" transform="translate(348.32 308.86)" font-size="6" fill="#424143">สามัคคี</text> </g>
          <g id="station-path-112" data-name="station-path">
            <circle cx="339.64" cy="311.77" r="3.4" fill="#fff" stroke="#FFB2DD" stroke-width="1.6" class="station-id-PK04"></circle>
          </g>
        </g>
        <g id="station_PK05" data-name="station" data-station-id="PK05">
          <g id="label-en-113" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(332.03 298)" font-size="6" fill="#424143">Wat Chonprathan</text> </g>
          <g id="label-th-113" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(275.02 298)" font-size="6" fill="#424143">วัดชลประทาน</text> </g>
          <g id="station-path-113" data-name="station-path">
            <circle cx="322.76" cy="294.86" r="3.4" fill="#fff" stroke="#FFB2DD" stroke-width="1.6" class="station-id-PK05"></circle>
          </g>
        </g>
        <g id="station_PK06" data-name="station" data-station-id="PK06">
          <g id="label-en-114" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(316.65 261.5)" font-size="6" fill="#424143">Yeak Pak Ket</text> </g>
          <g id="label-th-114" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(310.46 261.5)" font-size="6" fill="#424143">แยกปากเกร็ด</text> </g>
          <g id="station-path-114" data-name="station-path">
            <circle cx="326.21" cy="270.33" r="3.4" fill="#fff" stroke="#FFB2DD" stroke-width="1.6" class="station-id-PK06"></circle>
          </g>
        </g>
        <g id="station_PK07" data-name="station" data-station-id="PK07">
          <g id="label-en-115" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(347.87 261.5)" font-size="6" fill="#424143">Pak Kret Bypass</text> </g>
          <g id="label-th-115" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(333 284.5)" font-size="6" fill="#424143">เลี่ยงเมืองปากเกร็ด</text> </g>
          <g id="station-path-115" data-name="station-path">
            <circle cx="357.42" cy="270.33" r="3.4" fill="#fff" stroke="#FFB2DD" stroke-width="1.6" class="station-id-PK07"></circle>
          </g>
        </g>
        <g id="station_PK08" data-name="station" data-station-id="PK08">
          <g id="label-en-116" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(384.64 261.5)" font-size="6" fill="#424143">Chaeng Watthana - Pak Kret 28</text> </g>
          <g id="label-th-116" data-name="label-th"><text text-rendering="geometricPrecision" transform="translate(378.29 248.5)" font-size="6" fill="#424143">
            <tspan x="2" y="0">แจ้งวัฒนะ</tspan>
            <tspan x="12" y="6">-</tspan>
            <tspan x="0" y="13">ปากเกร็ด 28</tspan>
          </text></g>
          <g id="station-path-116" data-name="station-path">
            <circle cx="392.09" cy="270.33" r="3.4" fill="#fff" stroke="#FFB2DD" stroke-width="1.6" class="station-id-PK08"></circle>
          </g>
        </g>
        <g id="station_PK09" data-name="station" data-station-id="PK09">
          <g id="label-en-117" data-name="label-en"><text text-rendering="geometricPrecision" transform="translate(414.23 261.5)" font-size="6" fill="#424143">Si Rat</text></g>
          <g id="label-th-117" data-name="label-th"><text text-rendering="geometricPrecision" transform="translate(420.27 261.5)" font-size="6" fill="#424143">ศรีรัช</text></g>
          <g id="station-path-117" data-name="station-path">
            <circle cx="427.21" cy="270.33" r="3.4" fill="#fff" stroke="#FFB2DD" stroke-width="1.6" class="station-id-PK09"></circle>
          </g>
        </g>
        <g id="station_PK10" data-name="station" data-station-id="PK10">
          <g id="station-path-136" data-name="station-path">
            <circle cx="462.76" cy="270.33" r="3.4" fill="#fff" stroke="#FFB2DD" stroke-width="1.6" class="station-id-PK10"></circle>
          </g>
          <g id="label-en-136" data-name="label-en"><text text-rendering="geometricPrecision" transform="translate(455.65 261.5)" font-size="6" fill="#424143">Mung ThongThani</text></g>
          <g id="label-th-136" data-name="label-th"><text text-rendering="geometricPrecision" transform="translate(446.58 261.5)" font-size="6" fill="#424143">เมืองทองธานี</text></g>
        </g>
        <g id="station_PK11" data-name="station" data-station-id="PK11">
          <g id="label-en-118" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(480.51 284.5)" font-size="6" fill="#424143">Chaeng Watthana 14</text> </g>
          <g id="label-th-118" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(475.56 284.5)" font-size="6" fill="#424143">แจ้งวัฒนา 14</text> </g>
          <g id="station-path-118" data-name="station-path">
            <circle cx="488.96" cy="270.33" r="3.4" fill="#fff" stroke="#FFB2DD" stroke-width="1.6" class="station-id-PK11"></circle>
          </g>
        </g>
        <g id="station_PK12" data-name="station" data-station-id="PK12">
          <g id="label-en-119" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(509.05 261.5)" font-size="6" fill="#424143">Government Complex</text> </g>
          <g id="label-th-119" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(508.39 261.5)" font-size="6" fill="#424143">ศูนย์ราชการฯ</text> </g>
          <g id="station-path-119" data-name="station-path">
            <circle cx="522.85" cy="270.33" r="3.4" fill="#fff" stroke="#FFB2DD" stroke-width="1.6" class="station-id-PK12"></circle>
          </g>
        </g>
        <g id="station_PK13" data-name="station" data-station-id="PK13">
          <g id="label-en-120" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(547.96 284.5)" font-size="6" fill="#424143">National Telecom</text> </g>
          <g id="label-th-120" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(546.9 284.5)" font-size="6" fill="#424143">ทีโอที</text> </g>
          <g id="station-path-120" data-name="station-path">
            <circle cx="552.13" cy="270.33" r="3.4" fill="#fff" stroke="#FFB2DD" stroke-width="1.6" class="station-id-PK13"></circle>
          </g>
        </g>
        <g id="station_PK15" data-name="station" data-station-id="PK15">
          <g id="label-en-121" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(608.71 284.5)" font-size="6" fill="#424143">Rajabhat Phranakhon</text> </g>
          <g id="label-th-121" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(604.53 284.5)" font-size="6" fill="#424143">ราชภัฏพระนคร</text> </g>
          <g id="station-path-121" data-name="station-path">
            <circle cx="618.6" cy="270.33" r="3.4" fill="#fff" stroke="#FFB2DD" stroke-width="1.6" class="station-id-PK15"></circle>
          </g>
        </g>
        <g id="station_PK17" data-name="station" data-station-id="PK17">
          <g id="label-en-122" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(720.04 261.5)" font-size="6" fill="#424143">Ram Inthra 3</text> </g>
          <g id="label-th-122" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(721.91 261.5)" font-size="6" fill="#424143">รามอินทรา 3</text> </g>
          <g id="station-path-122" data-name="station-path">
            <circle cx="734.76" cy="270.33" r="3.4" fill="#fff" stroke="#FFB2DD" stroke-width="1.6" class="station-id-PK17"></circle>
          </g>
        </g>
        <g id="station_PK18" data-name="station" data-station-id="PK18">
          <g id="label-en-123" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(770.91 261.5)" font-size="6" fill="#424143">Lat Pla Khao</text> </g>
          <g id="label-th-123" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(773.52 261.5)" font-size="6" fill="#424143">ลาดปลาเค้า</text> </g>
          <g id="station-path-123" data-name="station-path">
            <circle cx="785.18" cy="270.33" r="3.4" fill="#fff" stroke="#FFB2DD" stroke-width="1.6" class="station-id-PK18"></circle>
          </g>
        </g>
        <g id="station_PK19" data-name="station" data-station-id="PK19">
          <g id="label-en-124" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(821.41 261.5)" font-size="6" fill="#424143">Ram Inthra Kor Mor 4</text> </g>
          <g id="label-th-124" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(823.27 261.5)" font-size="6" fill="#424143">รามอินทรา กม.4</text> </g>
          <g id="station-path-124" data-name="station-path">
            <circle cx="837.44" cy="270.33" r="3.4" fill="#fff" stroke="#FFB2DD" stroke-width="1.6" class="station-id-PK19"></circle>
          </g>
        </g>
        <g id="station_PK20" data-name="station" data-station-id="PK20">
          <g id="label-en-125" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(873.96 261.5)" font-size="6" fill="#424143">Maiyalap</text> </g>
          <g id="label-th-125" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(876.84 261.5)" font-size="6" fill="#424143">มัยลาภ</text> </g>
          <g id="station-path-125" data-name="station-path">
            <circle cx="884.03" cy="270.33" r="3.4" fill="#fff" stroke="#FFB2DD" stroke-width="1.6" class="station-id-PK20"></circle>
          </g>
        </g>
        <g id="station_PK21" data-name="station" data-station-id="PK21">
          <g id="label-en-126" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(913.07 261.5)" font-size="6" fill="#424143">Vacharaphol</text> </g>
          <g id="label-th-126" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(920.65 261.5)" font-size="6" fill="#424143">วัชรพล</text> </g>
          <g id="station-path-126" data-name="station-path">
            <circle cx="927.86" cy="270.33" r="3.4" fill="#fff" stroke="#FFB2DD" stroke-width="1.6" class="station-id-PK21"></circle>
          </g>
        </g>
        <g id="station_PK22" data-name="station" data-station-id="PK22">
          <g id="label-en-127" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(966.02 261.5)" font-size="6" fill="#424143">Ram Inthra Kor Mor 6</text> </g>
          <g id="label-th-127" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(967.89 261.5)" font-size="6" fill="#424143">รามอินทรา กม.6</text> </g>
          <g id="station-path-127" data-name="station-path">
            <circle cx="982.05" cy="270.33" r="3.4" fill="#fff" stroke="#FFB2DD" stroke-width="1.6" class="station-id-PK22"></circle>
          </g>
        </g>
        <g id="station_PK23" data-name="station" data-station-id="PK23">
          <g id="label-en-128" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1021.81 261.5)" font-size="6" fill="#424143">Khu Bon</text> </g>
          <g id="label-th-128" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1025.38 261.5)" font-size="6" fill="#424143">คู้บอน</text> </g>
          <g id="station-path-128" data-name="station-path">
            <circle cx="1031.43" cy="270.33" r="3.4" fill="#fff" stroke="#FFB2DD" stroke-width="1.6" class="station-id-PK23"></circle>
          </g>
        </g>
        <g id="station_PK24" data-name="station" data-station-id="PK24">
          <g id="label-en-129" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1063.29 261.5)" font-size="6" fill="#424143">Ram Inthra Kor Mor 9</text> </g>
          <g id="label-th-129" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1064.43 261.5)" font-size="6" fill="#424143">รามอินทรา กม.9</text> </g>
          <g id="station-path-129" data-name="station-path">
            <circle cx="1078.6" cy="270.33" r="3.4" fill="#fff" stroke="#FFB2DD" stroke-width="1.6" class="station-id-PK24"></circle>
          </g>
        </g>
        <g id="station_PK25" data-name="station" data-station-id="PK25">
          <g id="label-en-130" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1123.45 290.18)" font-size="6" fill="#424143">Outer Ring Road - Ram Inthra</text> </g>
          <g id="label-th-130" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1123.45 290.18)" font-size="6" fill="#424143">วงแหวาน- รามอินทรา</text> </g>
          <g id="station-path-130" data-name="station-path">
            <circle cx="1115.58" cy="292.01" r="3.4" fill="#fff" stroke="#FFB2DD" stroke-width="1.6" class="station-id-PK25"></circle>
          </g>
        </g>
        <g id="station_PK26" data-name="station" data-station-id="PK26">
          <g id="label-en-131" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1148.7 312.95)" font-size="6" fill="#424143">Nopparat</text> </g>
          <g id="label-th-131" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1148.69 312.96)" font-size="6" fill="#424143">นพรัตน์</text> </g>
          <g id="station-path-131" data-name="station-path">
            <circle cx="1141.41" cy="317.79" r="3.4" fill="#fff" stroke="#FFB2DD" stroke-width="1.6" class="station-id-PK26"></circle>
          </g>
        </g>
        <g id="station_PK27" data-name="station" data-station-id="PK27">
          <g id="label-en-132" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1174.19 337.57)" font-size="6" fill="#424143">Bang Chan</text> </g>
          <g id="label-th-132" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1174.19 337.58)" font-size="6" fill="#424143">บางชัน</text> </g>
          <g id="station-path-132" data-name="station-path">
            <circle cx="1166.9" cy="343.41" r="3.4" fill="#fff" stroke="#FFB2DD" stroke-width="1.6" class="station-id-PK27"></circle>
          </g>
        </g>
        <g id="station_PK28" data-name="station" data-station-id="PK28">
          <g id="label-th-133" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1201.62 366.16)" font-size="6" fill="#424143">เศรษฐบุตรบำเพ็ญ</text> </g>
          <g id="label-en-133" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1202.12 366.16)" font-size="6" fill="#424143">Setthabutbamphen</text> </g>
          <g id="station-path-133" data-name="station-path">
            <circle cx="1193.29" cy="369.76" r="3.4" fill="#fff" stroke="#FFB2DD" stroke-width="1.6" class="station-id-PK28"></circle>
          </g>
        </g>
        <g id="station_PK29" data-name="station" data-station-id="PK29">
          <g id="label-en-134" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1230.51 394.8)" font-size="6" fill="#424143">Min Buri Market</text> </g>
          <g id="label-th-134" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1230.51 394.8)" font-size="6" fill="#424143">ตลาดมีนบุรี</text> </g>
          <g id="station-path-134" data-name="station-path">
            <circle cx="1222.22" cy="398.63" r="3.4" fill="#fff" stroke="#FFB2DD" stroke-width="1.6" class="station-id-PK29"></circle>
          </g>
        </g>
        <g id="station_PK30" data-name="station" data-station-id="PK30">
          <g id="label-en-135" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1269.75 433.7)" font-size="6" fill="#424143">Min Buri</text> </g>
          <g id="label-th-135" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1269.75 433.7)" font-size="6" fill="#424143">มีนบุรี</text> </g>
          <g id="station-path-135" data-name="station-path">
            <circle cx="1261.44" cy="437.31" r="3.4" fill="#fff" stroke="#FFB2DD" stroke-width="1.6" class="station-id-PK30"></circle>
          </g>
        </g>


      </g>
    </g>
    <g id="yellow-line" data-name="train-line">

      <g data-status="future">

        <g id="track-6-1" data-name="track">

          <path d="M0.0585938 1.76955H39.2486C41.9663 1.76423 44.575 2.83732 46.5023 4.75338C48.4296 6.66943 49.518 9.27187 49.5286 11.9895V21.4995C49.5803 25.9759 49.5632 30.0901 51.2404 32.5" stroke="#E0E0DF" stroke-width="4" fill="none" transform="translate(697.6 492.6)" stroke-miterlimit="10"></path>
        </g>

        <g id="station_YLEX02" data-name="station" data-station-id="YLEX02">
          <g id="label-en-139" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(684.2 485.92)" font-size="6" fill="#424143">Phaholyothin 24</text> </g>
          <g id="label-th-139" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(691.68 485.92)" font-size="6" fill="#424143">พลโยธิน 24</text> </g>
          <g id="station-path-139" data-name="station-path">
            <circle cx="697.87" cy="494.47" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-YLEX02"></circle>
          </g>
        </g>
        <g id="station_YLEX01" data-name="station" data-station-id="YLEX01">
          <g id="label-en-140" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(745.39 485.98)" font-size="6" fill="#424143">Chandrakasem</text> </g>
          <g id="label-th-140" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(745.39 485.98)" font-size="6" fill="#424143">จันทรเกษม</text> </g>
          <g id="station-path-140" data-name="station-path">
            <circle cx="743.91" cy="497.22" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-YLEX01"></circle>
          </g>
        </g>
      </g>

      <g data-status="open">

        <g id="track-6-2" data-name="track">
          <path d="M53 31.8301H285.248C286.625 31.8262 287.989 32.1006 289.257 32.6367C290.525 33.1728 291.672 33.9598 292.628 34.9501L440.818 187.81C442.687 189.732 443.729 192.309 443.718 194.99V560.13C443.718 562.854 442.636 565.466 440.71 567.392C438.784 569.318 436.172 570.4 433.448 570.4H348.018" stroke="#FCD110" stroke-width="4" transform="translate(697.6 492.6)" stroke-miterlimit="10"></path>
        </g>


        <g id="station_YL02" data-name="station" data-station-id="YL02">
          <g id="label-en-142" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(789.09 515.94)" font-size="6" fill="#424143">Phawana</text> </g>
          <g id="label-th-142" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(791.7 515.94)" font-size="6" fill="#424143">ภาวนา</text> </g>
          <g id="station-path-142" data-name="station-path">
            <circle cx="799.5" cy="524.56" r="3.4" fill="#fff" stroke="#FCD110" stroke-width="1.6" class="station-id-YL02"></circle>
          </g>
        </g>
        <g id="station_YL03" data-name="station" data-station-id="YL03">
          <g id="label-en-143" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(837.49 515.94)" font-size="6" fill="#424143">Chok Chai 4</text> </g>
          <g id="label-th-143" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(842.23 515.94)" font-size="6" fill="#424143">โชคชัย 4</text> </g>
          <g id="station-path-143" data-name="station-path">
            <circle cx="850.98" cy="524.56" r="3.4" fill="#fff" stroke="#FCD110" stroke-width="1.6" class="station-id-YL03"></circle>
          </g>
        </g>
        <g id="station_YL04" data-name="station" data-station-id="YL04">
          <g id="label-en-144" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(894.24 515.94)" font-size="6" fill="#424143">Lat Phrao 71</text> </g>
          <g id="label-th-144" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(894.24 515.94)" font-size="6" fill="#424143">ลาดพร้าว 71</text> </g>
          <g id="station-path-144" data-name="station-path">
            <circle cx="916.29" cy="524.56" r="3.4" fill="#fff" stroke="#FCD110" stroke-width="1.6" class="station-id-YL04"></circle>
          </g>
        </g>
        <g id="station_YL05" data-name="station" data-station-id="YL05">
          <g id="label-en-145" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(950.32 515.94)" font-size="6" fill="#424143">Lat Phrao 83</text> </g>
          <g id="label-th-145" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(951.5 513.14)" font-size="6" fill="#424143">ลาดพร้าว 83</text> </g>
          <g id="station-path-145" data-name="station-path">
            <circle cx="964.53" cy="524.56" r="3.4" fill="#fff" stroke="#FCD110" stroke-width="1.6" class="station-id-YL05"></circle>
          </g>
        </g>
        <g id="station_YL06" data-name="station" data-station-id="YL06">
          <g id="label-en-146" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1007.83 536.76)" font-size="6" fill="#424143">Mahat Thai</text> </g>
          <g id="label-th-146" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1007.83 536.76)" font-size="6" fill="#424143">มหาดไทย</text> </g>
          <g id="station-path-146" data-name="station-path">
            <circle cx="998.47" cy="535.81" r="3.4" fill="#fff" stroke="#FCD110" stroke-width="1.6" class="station-id-YL06"></circle>
          </g>
        </g>
        <g id="station_YL07" data-name="station" data-station-id="YL07">
          <g id="label-en-147" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(983.97 570.57)" font-size="6" fill="#424143">Lat Phrao 101</text> </g>
          <g id="label-th-147" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(985.59 570.57)" font-size="6" fill="#424143">ลาดพร้าว 101</text> </g>
          <g id="station-path-147" data-name="station-path">
            <circle cx="1029.53" cy="568.22" r="3.4" fill="#fff" stroke="#FCD110" stroke-width="1.6" class="station-id-YL07"></circle>
          </g>
        </g>
        <g id="station_YL08" data-name="station" data-station-id="YL08">
          <g id="label-en-148" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1013.6 598.87)" font-size="6" fill="#424143">Bang Kapi</text> </g>
          <g id="label-th-148" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1028.38 598.87)" font-size="6" fill="#424143">บางกะปิ</text> </g>
          <g id="station-path-148" data-name="station-path">
            <circle cx="1056.76" cy="595.47" r="3.4" fill="#fff" stroke="#FCD110" stroke-width="1.6" class="station-id-YL08"></circle>
          </g>
        </g>
        <g id="station_YL09" data-name="station" data-station-id="YL09">
          <g id="label-en-149" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1028.23 622.04)" font-size="6" fill="#424143">Yaek Lam Sali</text> </g>
          <g id="label-th-149" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1042.23 622.04)" font-size="6" fill="#424143">แยกลำสาลี</text> </g>
          <g id="station-path-149" data-name="station-path">
            <circle cx="1078.58" cy="618.09" r="3.4" fill="#fff" stroke="#FCD110" stroke-width="1.6" class="station-id-YL09"></circle>
          </g>
        </g>
        <g id="station_YL10" data-name="station" data-station-id="YL10">
          <g id="label-en-150" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1140.08 670.04)" font-size="6" fill="#424143">Si Kritha</text> </g>
          <g id="label-th-150" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1140.08 670.04)" font-size="6" fill="#424143">ศรีกรีฑา</text> </g>
          <g id="station-path-150" data-name="station-path">
            <circle cx="1131.54" cy="673.56" r="3.4" fill="#fff" stroke="#FCD110" stroke-width="1.6" class="station-id-YL10"></circle>
          </g>
        </g>

        <g id="station_YL12" data-name="station" data-station-id="YL12">
          <g id="label-en-152" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1150.17 770.7)" font-size="6" fill="#424143">Kalantan</text> </g>
          <g id="label-th-152" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1150.17 770.7)" font-size="6" fill="#424143">กลันตัน</text> </g>
          <g id="station-path-152" data-name="station-path">
            <circle cx="1141.87" cy="768.68" r="3.4" fill="#fff" stroke="#FCD110" stroke-width="1.6" class="station-id-YL12"></circle>
          </g>
        </g>
        <g id="station_YL13" data-name="station" data-station-id="YL13">
          <g id="label-en-153" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1150.17 807.03)" font-size="6" fill="#424143">Si Nut</text> </g>
          <g id="label-th-153" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1150.17 807.03)" font-size="6" fill="#424143">ศรีนุช</text> </g>
          <g id="station-path-153" data-name="station-path">
            <circle cx="1141.87" cy="805.01" r="3.4" fill="#fff" stroke="#FCD110" stroke-width="1.6" class="station-id-YL13"></circle>
          </g>
        </g>
        <g id="station_YL14" data-name="station" data-station-id="YL14">
          <g id="label-en-154" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1150.17 841.57)" font-size="6" fill="#424143">Srinagarindra 38</text> </g>
          <g id="label-th-154" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1150.17 841.57)" font-size="6" fill="#424143">ศรีนครินทร์ 38</text> </g>
          <g id="station-path-154" data-name="station-path">
            <circle cx="1141.87" cy="839.55" r="3.4" fill="#fff" stroke="#FCD110" stroke-width="1.6" class="station-id-YL14"></circle>
          </g>
        </g>
        <g id="station_YL15" data-name="station" data-station-id="YL15">
          <g id="label-en-155" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1150.17 876.51)" font-size="6" fill="#424143">Suan Luang Rama IX</text> </g>
          <g id="label-th-155" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1150.17 876.51)" font-size="6" fill="#424143">สวนหลวง ร.9</text> </g>
          <g id="station-path-155" data-name="station-path">
            <circle cx="1141.87" cy="874.49" r="3.4" fill="#fff" stroke="#FCD110" stroke-width="1.6" class="station-id-YL15"></circle>
          </g>
        </g>
        <g id="station_YL16" data-name="station" data-station-id="YL16">
          <g id="label-en-156" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1150.17 906.76)" font-size="6" fill="#424143">Si Udom</text> </g>
          <g id="label-th-156" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1150.17 906.76)" font-size="6" fill="#424143">ศรีอุดม</text> </g>
          <g id="station-path-156" data-name="station-path">
            <circle cx="1141.76" cy="904.74" r="3.4" fill="#fff" stroke="#FCD110" stroke-width="1.6" class="station-id-YL16"></circle>
          </g>
        </g>
        <g id="station_YL17" data-name="station" data-station-id="YL17">
          <g id="label-en-157" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1150.17 943.85)" font-size="6" fill="#424143">Si Iam</text> </g>
          <g id="label-th-157" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1150.17 943.85)" font-size="6" fill="#424143">ศรีเอี่ยม</text> </g>
          <g id="station-path-157" data-name="station-path">
            <circle cx="1141.76" cy="941.83" r="3.4" fill="#fff" stroke="#FCD110" stroke-width="1.6" class="station-id-YL17"></circle>
          </g>
        </g>
        <g id="station_YL18" data-name="station" data-station-id="YL18">
          <g id="label-en-158" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1150.17 977.41)" font-size="6" fill="#424143">Si La Salle</text> </g>
          <g id="label-th-158" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1150.17 977.41)" font-size="6" fill="#424143">ศรีลาซาล</text> </g>
          <g id="station-path-158" data-name="station-path">
            <circle cx="1141.96" cy="975.39" r="3.4" fill="#fff" stroke="#FCD110" stroke-width="1.6" class="station-id-YL18"></circle>
          </g>
        </g>
        <g id="station_YL19" data-name="station" data-station-id="YL19">
          <g id="label-en-159" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1150.17 1012.97)" font-size="6" fill="#424143">Si Bearing</text> </g>
          <g id="label-th-159" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1150.17 1012.97)" font-size="6" fill="#424143">ศรีแบริ่ง</text> </g>
          <g id="station-path-159" data-name="station-path">
            <circle cx="1141.96" cy="1010.94" r="3.4" fill="#fff" stroke="#FCD110" stroke-width="1.6" class="station-id-YL19"></circle>
          </g>
        </g>
        <g id="station_YL20" data-name="station" data-station-id="YL20">
          <g id="label-en-160" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1150.17 1045.24)" font-size="6" fill="#424143">Si Dan</text> </g>
          <g id="label-th-160" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1150.17 1045.24)" font-size="6" fill="#424143">ศรีด่าน</text> </g>
          <g id="station-path-160" data-name="station-path">
            <circle cx="1141.96" cy="1043.22" r="3.4" fill="#fff" stroke="#FCD110" stroke-width="1.6" class="station-id-YL20"></circle>
          </g>
        </g>
        <g id="station_YL21" data-name="station" data-station-id="YL21">
          <g id="label-en-161" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1103.6 1052.71)" font-size="6" fill="#424143">Si Thepha</text> </g>
          <g id="label-th-161" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1106.83 1052.71)" font-size="6" fill="#424143">ศรีเทพา</text> </g>
          <g id="station-path-161" data-name="station-path">
            <circle cx="1116.29" cy="1063.38" r="3.4" fill="#fff" stroke="#FCD110" stroke-width="1.6" class="station-id-YL21"></circle>
          </g>
        </g>
        <g id="station_YL22" data-name="station" data-station-id="YL22">
          <g id="label-en-162" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1066.75 1052.65)" font-size="6" fill="#424143">Thipphawan</text> </g>
          <g id="label-th-162" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1075.25 1052.65)" font-size="6" fill="#424143">ทิพวัล</text> </g>
          <g id="station-path-162" data-name="station-path">
            <circle cx="1082.53" cy="1063.38" r="3.4" fill="#fff" stroke="#FCD110" stroke-width="1.6" class="station-id-YL22"></circle>
          </g>
        </g>

      </g>
    </g>
    <g id="gold-line" data-name="train-line">

      <g data-status="future">
        <g id="station_G4" data-name="station" data-station-id="G4">
          <g id="label-en-167" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(520.88 929.45)" font-size="6" fill="#424143">Memorial Bridge</text> </g>
          <g id="label-th-167" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(521.85 929.45)" font-size="6" fill="#424143">สะพานพุทธ</text> </g>
          <g id="station-path-167" data-name="station-path">
            <circle cx="524.61" cy="937.29" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-G4"></circle>
          </g>
        </g>

        <g id="track-777" data-name="track">
          <path id="Line-14_2" d="M557.999 942.5L554.169 938.3C553.77 937.889 553.293 937.562 552.766 937.339C552.238 937.116 551.672 937 551.099 937H526.999" stroke="#E0E0DF" stroke-width="2" stroke-miterlimit="10"></path>
        </g>
      </g>
      <g data-status="open">
        <g id="track-7" data-name="track">
          <path id="Line-14" d="M596.869 994.82L600.079 991.31C600.821 990.503 601.225 989.443 601.208 988.347C601.192 987.251 600.755 986.204 599.989 985.42L557.499 942" stroke="#D0AB4F" stroke-width="4" stroke-miterlimit="10"></path>
        </g>




        <g id="station_G2" data-name="station" data-station-id="G2">
          <g id="label-en-165" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(594.27 971.47)" font-size="6" fill="#424143">Charoen Na Korn</text> </g>
          <g id="label-th-165" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(594.27 971.47)" font-size="6" fill="#424143">เจริญนคร</text> </g>
          <g id="station-path-165" data-name="station-path">
            <circle cx="584.81" cy="970.26" r="3.4" fill="#fff" stroke="#D0AB4F" stroke-width="1.6" class="station-id-G2"></circle>
          </g>
        </g>
        <g id="station_G3" data-name="station" data-station-id="G3">
          <g id="label-en-166" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(569.64 943.22)" font-size="6" fill="#424143">Klong San</text> </g>
          <g id="label-th-166" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(569.64 943.22)" font-size="6" fill="#424143">คลองสาน</text> </g>
          <g id="station-path-166" data-name="station-path">
            <circle cx="558.52" cy="942.23" r="3.4" fill="#fff" stroke="#D0AB4F" stroke-width="1.6" class="station-id-G3"></circle>
          </g>
        </g>
      </g>


    </g>
    <g id="purple-line" data-name="train-line">
      <g data-status="open">
        <g id="track-8" data-name="track">
          <path id="Line-15" d="M80.4,393.5v46.61a6.5,6.5,0,0,0,6.5,6.5H402.19a6.51,6.51,0,0,1,6.49,6.49v17.16a6.49,6.49,0,0,0,1.9,4.6L534.31,598.59a6.5,6.5,0,0,1,1.91,4.59v60.34" transform="translate(-25.75 -52.38)" fill="none" stroke="#9B54A2" stroke-miterlimit="10" stroke-width="4"></path>
        </g>
        <g id="station_PP01" data-name="station" data-station-id="PP01">
          <g id="label-en-168" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(64 342.5)" font-size="6" fill="#424143">Khlong Bang Phai</text> </g>
          <g id="label-th-168" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(64 342.5)" font-size="6" fill="#424143">คลองบางไผ่</text> </g>
          <g id="station-path-168" data-name="station-path">
            <circle cx="54.66" cy="340.45" r="3.4" fill="#fff" stroke="#9B54A2" stroke-width="1.6" class="station-id-PP01"></circle>
          </g>
        </g>
        <g id="station_PP02" data-name="station" data-station-id="PP02">
          <g id="label-en-169" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(64 366.5)" font-size="6" fill="#424143">Talad Bang Yai</text> </g>
          <g id="label-th-169" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(64 366.5)" font-size="6" fill="#424143">ตลาดบางใหญ่</text> </g>
          <g id="station-path-169" data-name="station-path">
            <circle cx="54.64" cy="364.51" r="3.4" fill="#fff" stroke="#9B54A2" stroke-width="1.6" class="station-id-PP02"></circle>
          </g>
        </g>
        <g id="station_PP03" data-name="station" data-station-id="PP03">
          <g id="label-en-170" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(52 405.5)" font-size="6" fill="#424143">Sam Yaek Bang Yai</text> </g>
          <g id="label-th-170" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(54 405.5)" font-size="6" fill="#424143">สามแยกบางใหญ่</text> </g>
          <g id="station-path-170" data-name="station-path">
            <circle cx="78.7" cy="393.46" r="3.4" fill="#fff" stroke="#9B54A2" stroke-width="1.6" class="station-id-PP03"></circle>
          </g>
        </g>
        <g id="station_PP04" data-name="station" data-station-id="PP04">
          <g id="label-en-171" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(106 383.5)" font-size="6" fill="#424143">Bang Phlu</text> </g>
          <g id="label-th-171" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(110.7 383.5)" font-size="6" fill="#424143">บางพลู</text> </g>
          <g id="station-path-171" data-name="station-path">
            <circle cx="117.81" cy="393.46" r="3.4" fill="#fff" stroke="#9B54A2" stroke-width="1.6" class="station-id-PP04"></circle>
          </g>
        </g>
        <g id="station_PP05" data-name="station" data-station-id="PP05">
          <g id="station-path-172" data-name="station-path">
            <circle cx="150.89" cy="393.46" r="3.4" fill="#fff" stroke="#9B54A2" stroke-width="1.6" class="station-id-PP05"></circle>
          </g>
          <g id="label-en-172" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(132 405.5)" font-size="6" fill="#424143">Bang Rak Yai</text> </g>
          <g id="label-th-172" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(139.53 405.5)" font-size="6" fill="#424143">บางรักใหญ่</text> </g>
        </g>
        <g id="station_PP06" data-name="station" data-station-id="PP06">
          <g id="label-en-173" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(155 383.5)" font-size="6" fill="#424143">Bang Rak Noi-Tha It</text> </g>
          <g id="label-th-173" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(165 383.5)" font-size="6" fill="#424143">บางรักน้อย-ท่าอิฐ</text> </g>
          <g id="station-path-173" data-name="station-path">
            <circle cx="184.26" cy="393.46" r="3.4" fill="#fff" stroke="#9B54A2" stroke-width="1.6" class="station-id-PP06"></circle>
          </g>
        </g>
        <g id="station_PP07" data-name="station" data-station-id="PP07">
          <g id="station-path-174" data-name="station-path">
            <circle cx="216.34" cy="393.46" r="3.4" fill="#fff" stroke="#9B54A2" stroke-width="1.6" class="station-id-PP07"></circle>
          </g>
          <g id="label-en-174" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(208 405.5)" font-size="6" fill="#424143">Sai Ma</text> </g>
          <g id="label-th-174" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(210.04 405.5)" font-size="6" fill="#424143">ไทรม้า</text> </g>
        </g>
        <g id="station_PP08" data-name="station" data-station-id="PP08">
          <g id="station-path-175" data-name="station-path">
            <circle cx="256.29" cy="393.46" r="3.4" fill="#fff" stroke="#9B54A2" stroke-width="1.6" class="station-id-PP08"></circle>
          </g>
          <g id="label-en-175" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(237 400.5)" font-size="6" fill="#424143">
            <tspan x="0.147461" y="4.68182">Phra Nang Klao</tspan>
            <tspan x="12.7832" y="11.6818">Bridge</tspan>
          </text> </g>
          <g id="label-th-175" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(231.85 405.5)" font-size="6" fill="#424143">สะพานพระนั่งเกล้า</text> </g>
        </g>
        <g id="station_PP09" data-name="station" data-station-id="PP09">
          <g id="station-path-176" data-name="station-path">
            <circle cx="289.37" cy="393.46" r="3.4" fill="#fff" stroke="#9B54A2" stroke-width="1.6" class="station-id-PP09"></circle>
          </g>
          <g id="label-en-176" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(267 383.5)" font-size="6" fill="#424143">Yaek Nonthaburi 1</text> </g>
          <g id="label-th-176" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(275.54 383.5)" font-size="6" fill="#424143">แยกนนทบุรี 1</text> </g>
        </g>
        <g id="station_PP10" data-name="station" data-station-id="PP10">
          <g id="station-path-177" data-name="station-path">
            <circle cx="324.26" cy="393.46" r="3.4" fill="#fff" stroke="#9B54A2" stroke-width="1.6" class="station-id-PP10"></circle>
          </g>
          <g id="label-en-177" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(308 405.5)" font-size="6" fill="#424143">Bang Krasor</text> </g>
          <g id="label-th-177" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(313.81 405.5)" font-size="6" fill="#424143">บางกระสอ</text> </g>
        </g>

        <g id="station_PP12" data-name="station" data-station-id="PP12">
          <g id="label-en-179" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(420 448.32)" font-size="6" fill="#424143">Ministry of Public Health</text> </g>
          <g id="label-th-179" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(420 448.32)" font-size="6" fill="#424143">กระทรวงสาธารณสุข</text> </g>
          <g id="station-path-179" data-name="station-path">
            <circle cx="410.72" cy="448.61" r="3.4" fill="#fff" stroke="#9B54A2" stroke-width="1.6" class="station-id-PP12"></circle>
          </g>
        </g>
        <g id="station_PP13" data-name="station" data-station-id="PP13">
          <g id="label-en-180" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(453.13 484.02)" font-size="6" fill="#424143">Yaek Tiwanon</text> </g>
          <g id="label-th-180" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(452.86 484.02)" font-size="6" fill="#424143">แยกติวานนท์</text> </g>
          <g id="station-path-180" data-name="station-path">
            <circle cx="444.69" cy="482.81" r="3.4" fill="#fff" stroke="#9B54A2" stroke-width="1.6" class="station-id-PP13"></circle>
          </g>
        </g>
        <g id="station_PP14" data-name="station" data-station-id="PP14">
          <g id="label-en-181" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(487.01 517.54)" font-size="6" fill="#424143">Wong Sawang</text> </g>
          <g id="label-th-181" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(487.01 517.54)" font-size="6" fill="#424143">วงศ์สว่าง</text> </g>
          <g id="station-path-181" data-name="station-path">
            <circle cx="478.68" cy="516.33" r="3.4" fill="#fff" stroke="#9B54A2" stroke-width="1.6" class="station-id-PP14"></circle>
          </g>
        </g>

      </g>
      <g id="purple-line-extension" data-status="future">
        <g id="track-9" data-name="track">
          <path d="M536.22,667.7v398.5a6.49,6.49,0,0,0,1.9,4.59l173.27,173.27" transform="translate(-25.75 -52.38)" fill="none" stroke="#e0e0df" stroke-miterlimit="10" stroke-width="2"></path>
        </g>
        <g id="station_PP17" data-name="station" data-station-id="PP17">
          <g id="label-en-184" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(518.65 639.5)" font-size="6" fill="#424143">Parliament House</text> </g>
          <g id="label-th-184" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(518.65 639.5)" font-size="6" fill="#424143">รัฐสภา</text> </g>
          <g id="station-path-184" data-name="station-path">
            <circle cx="510.29" cy="642.98" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-PP17"></circle>
          </g>
        </g>
        <g id="station_PP18" data-name="station" data-station-id="PP18">
          <g id="label-en-185" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(518.65 672.91)" font-size="6" fill="#424143">Sri Yan</text> </g>
          <g id="label-th-185" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(518.65 672.91)" font-size="6" fill="#424143">ศรีย่าน</text> </g>
          <g id="station-path-185" data-name="station-path">
            <circle cx="510.29" cy="676.4" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-PP18"></circle>
          </g>
        </g>
        <g id="station_PP19" data-name="station" data-station-id="PP19">
          <g id="label-en-186" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(521.61 705.65)" font-size="6" fill="#424143">Vajira Hospital</text> </g>
          <g id="label-th-186" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(518.65 705.65)" font-size="6" fill="#424143">วชิรพยาบาล</text> </g>
          <g id="station-path-186" data-name="station-path">
            <circle cx="510.29" cy="709.13" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-PP19"></circle>
          </g>
        </g>
        <g id="station_PP20" data-name="station" data-station-id="PP20">
          <g id="label-en-187" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(518.65 737.57)" font-size="6" fill="#424143">National Library</text> </g>
          <g id="label-th-187" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(518.65 737.57)" font-size="6" fill="#424143">หอสมุดแห่งชาติ</text> </g>
          <g id="station-path-187" data-name="station-path">
            <circle cx="510.29" cy="741.05" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-PP20"></circle>
          </g>
        </g>
        <g id="station_PP21" data-name="station" data-station-id="PP21">
          <g id="label-en-188" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(480.52 775.08)" font-size="6" fill="#424143">Bang Khun Phrom</text> </g>
          <g id="label-th-188" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(474.82 775.08)" font-size="6" fill="#424143">บางขุนพรหม</text> </g>
          <g id="station-path-188" data-name="station-path">
            <circle cx="510.29" cy="778.56" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-PP21"></circle>
          </g>
        </g>
        <g id="station_PP22" data-name="station" data-station-id="PP22">
          <g id="label-en-189" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(482.32 808.9)" font-size="6" fill="#424143">Phan Fa</text> </g>
          <g id="label-th-189" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(485.84 808.9)" font-size="6" fill="#424143">ผ่านฟ้า</text> </g>
          <g id="station-path-189" data-name="station-path">
            <circle cx="510.29" cy="812.38" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-PP22"></circle>
          </g>
        </g>
        <g id="station_PP23" data-name="station" data-station-id="PP23">
          <g id="label-en-190" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(481.88 857.07)" font-size="6" fill="#424143">Sam Yot</text> </g>
          <g id="label-th-190" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(483.24 857.07)" font-size="6" fill="#424143">สามยอด</text> </g>
          <g id="station-path-190" data-name="station-path">
            <circle cx="510.32" cy="855.86" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-PP23"></circle>
          </g>
        </g>
        <g id="station_PP24" data-name="station" data-station-id="PP24">
          <g id="label-en-191" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(479.08 931.95)" font-size="6" fill="#424143">Memorial Bridge</text> </g>
          <g id="label-th-191" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(477.02 931.95)" font-size="6" fill="#424143">สะพานพุทธ</text> </g>
          <g id="station-path-191" data-name="station-path">
            <circle cx="510.29" cy="935.43" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-PP24"></circle>
          </g>
        </g>
        <g id="station_PP25" data-name="station" data-station-id="PP25">
          <g id="label-en-192" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(468.55 979.19)" font-size="6" fill="#424143">Wong Wian Yai</text> </g>
          <g id="label-th-192" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(476.35 979.19)" font-size="6" fill="#424143">วงเวียนใหญ่</text> </g>
          <g id="station-path-192" data-name="station-path">
            <circle cx="510.18" cy="983.67" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-PP25"></circle>
          </g>
        </g>
        <g id="station_PP26" data-name="station" data-station-id="PP26">
          <g id="label-en-193" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(534.9 1063.54)" font-size="6" fill="#424143">Sam Rae</text> </g>
          <g id="label-th-193" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(537.26 1063.54)" font-size="6" fill="#424143">สำเหร่</text> </g>
          <g id="station-path-193" data-name="station-path">
            <circle cx="559.22" cy="1065.02" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-PP26"></circle>
          </g>
        </g>
        <g id="station_PP27" data-name="station" data-station-id="PP27">
          <g id="label-en-194" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(552.77 1079.89)" font-size="6" fill="#424143">DaoKhanong</text> </g>
          <g id="label-th-194" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(546.04 1081.85)" font-size="6" fill="#424143">ดาวคะนอง</text> </g>
          <g id="station-path-194" data-name="station-path">
            <circle cx="577.57" cy="1083.38" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-PP27"></circle>
          </g>
        </g>
        <g id="station_PP28" data-name="station" data-station-id="PP28">
          <g id="label-en-195" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(555.01 1100.09)" font-size="6" fill="#424143">Bang Pakaeo</text> </g>
          <g id="label-th-195" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(563.94 1100.09)" font-size="6" fill="#424143">บางปะแก้ว</text> </g>
          <g id="station-path-195" data-name="station-path">
            <circle cx="595.59" cy="1101.58" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-PP28"></circle>
          </g>
        </g>
        <g id="station_PP29" data-name="station" data-station-id="PP29">
          <g id="label-en-196" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(577.44 1118.49)" font-size="6" fill="#424143">Bang Pakok</text> </g>
          <g id="label-th-196" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(582.67 1118.49)" font-size="6" fill="#424143">บางปะกอก</text> </g>
          <g id="station-path-196" data-name="station-path">
            <circle cx="614.41" cy="1120.39" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-PP29"></circle>
          </g>
        </g>
        <g id="station_PP30" data-name="station" data-station-id="PP30">
          <g id="label-en-197" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(590.34 1136.98)" font-size="6" fill="#424143">Yeak Pacha Uthit</text> </g>
          <g id="label-th-197" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(590.34 1139.48)" font-size="6" fill="#424143">แยกประชาอุทิศ</text> </g>
          <g id="station-path-197" data-name="station-path">
            <circle cx="630.98" cy="1136.27" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-PP30"></circle>
          </g>
        </g>
        <g id="station_PP31" data-name="station" data-station-id="PP31">
          <g id="label-en-198" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(611.75 1156.57)" font-size="6" fill="#424143">Rat Burana</text> </g>
          <g id="label-th-198" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(612.75 1153.57)" font-size="6" fill="#424143">ราษฎร์บูรณะ</text> </g>
          <g id="station-path-198" data-name="station-path">
            <circle cx="649.06" cy="1156.05" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-PP31"></circle>
          </g>
        </g>
        <g id="station_PP32" data-name="station" data-station-id="PP32">
          <g id="label-en-199" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(640 1169.89)" font-size="6" fill="#424143">Phra Pradaeng</text> </g>
          <g id="label-th-199" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(634.48 1172.39)" font-size="6" fill="#424143">พระประแดง</text> </g>
          <g id="station-path-199" data-name="station-path">
            <circle cx="668.88" cy="1174.87" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-PP32"></circle>
          </g>
        </g>
        <g id="station_PP33" data-name="station" data-station-id="PP33">
          <g id="label-en-200" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(656.99 1191.75)" font-size="6" fill="#424143">Khru Nai</text> </g>
          <g id="label-th-200" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(656.98 1191.75)" font-size="6" fill="#424143">ครุใน</text> </g>
          <g id="station-path-200" data-name="station-path">
            <circle cx="687.45" cy="1193.44" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-PP33"></circle>
          </g>
        </g>
      </g>
    </g>
    <g id="mrt" data-name="train-line">
      <g id="mrt-extension" data-status="future">
        <g id="track-10" data-name="track">
          <path id="Line-20" d="M110.76,969.91H230.92" transform="translate(-25.75 -52.38)" fill="none" stroke="#e0e0df" stroke-miterlimit="10" stroke-width="2"></path>
        </g>
        <g id="station_BL39" data-name="station" data-station-id="BL39">
          <g id="label-en-201" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(167.96 905.24)" font-size="6" fill="#424143">Phutthamonthon Sai 2</text> </g>
          <g id="label-th-201" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(163.55 905.24)" font-size="6" fill="#424143">พุทธมณฑลสาย 2</text> </g>
          <g id="station-path-201" data-name="station-path">
            <circle cx="176.29" cy="917.22" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-BL39"></circle>
          </g>
        </g>
        <g id="station_BL40" data-name="station" data-station-id="BL40">
          <g id="label-en-202" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(138.6 904.56)" font-size="6" fill="#424143">Thawi watthana</text> </g>
          <g id="label-th-202" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(136.3 909.63)" font-size="6" fill="#424143">ทวีวัฒนา</text> </g>
          <g id="station-path-202" data-name="station-path">
            <circle cx="148.1" cy="917.22" r="3.4" transform="" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-BL40"></circle>
          </g>
        </g>
        <g id="station_BL41" data-name="station" data-station-id="BL41">
          <g id="station-path-203" data-name="station-path">
            <circle cx="116.62" cy="917.22" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-BL41"></circle>
          </g>
          <g id="label-en-203" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(108.29 904.56)" font-size="6" fill="#424143">Phutthamonthon Sai 3</text> </g>
          <g id="label-th-203" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(103.88 904.56)" font-size="6" fill="#424143">พุทธมณฑลสาย 3</text> </g>
        </g>
        <g id="station_BL42" data-name="station" data-station-id="BL42">
          <g id="label-en-204" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(77.84 904.56)" font-size="6" fill="#424143">Phutthamonthon Sai 4</text> </g>
          <g id="label-th-204" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(73.42 904.89)" font-size="6" fill="#424143">พุทธมณฑลสาย 4</text> </g>
          <g id="station-path-204" data-name="station-path">
            <circle cx="86.16" cy="917.22" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-BL42"></circle>
          </g>
        </g>
      </g>
      <g data-status="open">
        <g id="track-11" data-name="track">
          <path id="Line-19" d="M232,970.48H476.34a7.42,7.42,0,0,0,5.24-2.17l41.1-41.1a7.42,7.42,0,0,1,5.25-2.17H865.39a7.43,7.43,0,0,0,7.42-7.43V682.37a7.46,7.46,0,0,0-2-5.07l-80.64-86.37a7.42,7.42,0,0,0-5.42-2.35l-92.47.83a5.19,5.19,0,0,0-5.15,5.2v61.83a7.43,7.43,0,0,1-7.42,7.43H515.44a7.42,7.42,0,0,0-5.25,2.17l-78,78a7.39,7.39,0,0,0-2.18,5.25V970.48" transform="translate(-25.75 -52.38)" fill="none" stroke="#0e6494" stroke-miterlimit="10" stroke-width="4"></path>
        </g>
        <g id="station_BL01" data-name="station" data-station-id="BL01">
          <g id="label-en-205" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(408.17 912.08)" font-size="6" fill="#424143">Tha Phra</text> </g>
          <g id="label-th-205" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(411.42 912.08)" font-size="6" fill="#424143">ท่าพระ</text> </g>
          <g id="station-path-205" data-name="station-path">
            <circle cx="404.26" cy="918.11" r="3.4" fill="#fff" stroke="#0e6494" stroke-width="1.6" class="station-id-BL01"></circle>
          </g>
        </g>
        <g id="station_BL02" data-name="station" data-station-id="BL02">
          <g id="label-en-206" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(370.04 880.44)" font-size="6" fill="#424143">Charan 13</text> </g>
          <g id="label-th-206" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(377 879.5)" font-size="6" fill="#424143">จรัญ 13</text> </g>
          <g id="station-path-206" data-name="station-path">
            <circle cx="404.26" cy="877.84" r="3.4" fill="#fff" stroke="#0e6494" stroke-width="1.6" class="station-id-BL02"></circle>
          </g>
        </g>
        <g id="station_BL03" data-name="station" data-station-id="BL03">
          <g id="label-en-207" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(374.73 848.5)" font-size="6" fill="#424143">Fai Chai</text> </g>
          <g id="label-th-207" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(381 848.5)" font-size="6" fill="#424143">ไฟฉาย</text> </g>
          <g id="station-path-207" data-name="station-path">
            <circle cx="404.26" cy="846.67" r="3.4" fill="#fff" stroke="#0e6494" stroke-width="1.6" class="station-id-BL03"></circle>
          </g>
        </g>
        <g id="station_BL04" data-name="station" data-station-id="BL04">
          <g id="label-en-208" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(354.03 800)" font-size="6" fill="#424143">Bang Khun Non</text> </g>
          <g id="label-th-208" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(369 800)" font-size="6" fill="#424143">บางขุนนนท์</text> </g>
          <g id="station-path-208" data-name="station-path">
            <circle cx="404.26" cy="798.36" r="3.4" fill="#fff" stroke="#0e6494" stroke-width="1.6" class="station-id-BL04"></circle>
          </g>
        </g>
        <g id="station_BL05" data-name="station" data-station-id="BL05">
          <g id="label-en-209" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(360.79 768.7)" font-size="6" fill="#424143">Bang Yi Khan</text> </g>
          <g id="label-th-209" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(377 768.7)" font-size="6" fill="#424143">บางยี่ขัน</text> </g>
          <g id="station-path-209" data-name="station-path">
            <circle cx="404.26" cy="766.99" r="3.4" fill="#fff" stroke="#0e6494" stroke-width="1.6" class="station-id-BL05"></circle>
          </g>
        </g>
        <g id="station_BL06" data-name="station" data-station-id="BL06">
          <g id="label-en-210" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(367.91 723.5)" font-size="6" fill="#424143">Sirindhorn</text> </g>
          <g id="label-th-210" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(380 723.5)" font-size="6" fill="#424143">สิรินธร</text> </g>
          <g id="station-path-210" data-name="station-path">
            <circle cx="404.26" cy="721.96" r="3.4" fill="#fff" stroke="#0e6494" stroke-width="1.6" class="station-id-BL06"></circle>
          </g>
        </g>
        <g id="station_BL07" data-name="station" data-station-id="BL07">
          <g id="label-en-211" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(383.92 678.13)" font-size="6" fill="#424143">Bang Phlat</text> </g>
          <g id="label-th-211" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(390.25 678.13)" font-size="6" fill="#424143">บางพลัด</text> </g>
          <g id="station-path-211" data-name="station-path">
            <circle cx="420.68" cy="676.92" r="3.4" fill="#fff" stroke="#0e6494" stroke-width="1.6" class="station-id-BL07"></circle>
          </g>
        </g>
        <g id="station_BL08" data-name="station" data-station-id="BL08">
          <g id="label-en-212" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(415.23 656.24)" font-size="6" fill="#424143">Bang O</text> </g>
          <g id="label-th-212" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(417.12 656.24)" font-size="6" fill="#424143">บางอ้อ</text> </g>
          <g id="station-path-212" data-name="station-path">
            <circle cx="442.57" cy="655.03" r="3.4" fill="#fff" stroke="#0e6494" stroke-width="1.6" class="station-id-BL08"></circle>
          </g>
        </g>
        <g id="station_BL09" data-name="station" data-station-id="BL09">
          <g id="label-en-213" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(433.31 631.65)" font-size="6" fill="#424143">Bang Pho</text> </g>
          <g id="label-th-213" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(442.2 631.65)" font-size="6" fill="#424143">บางโพ</text> </g>
          <g id="station-path-213" data-name="station-path">
            <circle cx="467.15" cy="630.44" r="3.4" fill="#fff" stroke="#0e6494" stroke-width="1.6" class="station-id-BL09"></circle>
          </g>
        </g>


        <g id="station_BL12" data-name="station" data-station-id="BL12">
          <g id="label-en-216" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(614 622.2)" font-size="6" fill="#424143">Kamphaeng Phet</text> </g>
          <g id="label-th-216" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(620 622.2)" font-size="6" fill="#424143">กำแพงเพชร</text> </g>
          <g id="station-path-216" data-name="station-path">
            <circle cx="635.07" cy="611.21" r="3.4" fill="#fff" stroke="#0e6494" stroke-width="1.6" class="station-id-BL12"></circle>
          </g>
        </g>

        <g id="station_BL14" data-name="station" data-station-id="BL14">
          <g id="label-en-218" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(684 547.58)" font-size="6" fill="#424143">Phahon Yothin</text> </g>
          <g id="label-th-218" data-name="label-th">
            <text text-rendering="geometricPrecision" transform="translate(684 547.58)" font-size="6" fill="#424143">พหลโยธิน</text>
          </g>
          <g id="station-path-218" data-name="station-path">
            <circle cx="685.38" cy="536.18" r="3.4" fill="#fff" stroke="#0e6494" stroke-width="1.6" class="station-id-BL14"></circle>
          </g>
        </g>

        <g id="station_BL16" data-name="station" data-station-id="BL16">
          <g id="label-en-220" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(794.98 563.39)" font-size="6" fill="#424143">Ratchadaphisek</text> </g>
          <g id="label-th-220" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(794.98 563.39)" font-size="6" fill="#424143">รัชดาภิเษก</text> </g>
          <g id="station-path-220" data-name="station-path">
            <circle cx="786.02" cy="562.05" r="3.4" fill="#fff" stroke="#0e6494" stroke-width="1.6" class="station-id-BL16"></circle>
          </g>
        </g>
        <g id="station_BL17" data-name="station" data-station-id="BL17">
          <g id="label-en-221" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(817.58 587.85)" font-size="6" fill="#424143">Sutthisan</text> </g>
          <g id="label-th-221" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(817.58 587.85)" font-size="6" fill="#424143">สุทธิสาร</text> </g>
          <g id="station-path-221" data-name="station-path">
            <circle cx="808.62" cy="586.51" r="3.4" fill="#fff" stroke="#0e6494" stroke-width="1.6" class="station-id-BL17"></circle>
          </g>
        </g>
        <g id="station_BL18" data-name="station" data-station-id="BL18">
          <g id="label-en-222" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(839.68 610.15)" font-size="6" fill="#424143">Huai Khwang</text> </g>
          <g id="label-th-222" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(839.68 610.15)" font-size="6" fill="#424143">ห้วยขวาง</text> </g>
          <g id="station-path-222" data-name="station-path">
            <circle cx="830.72" cy="608.81" r="3.4" fill="#fff" stroke="#0e6494" stroke-width="1.6" class="station-id-BL18"></circle>
          </g>
        </g>
        <g id="station_BL19" data-name="station" data-station-id="BL19">
          <g id="label-en-223" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(856.02 635.74)" font-size="6" fill="#424143">Thailand Cultural Centre</text> </g>
          <g id="label-th-223" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(856.29 635.42)" font-size="6" fill="#424143">ศูนย์วัฒนธรรมแห่งประเทศไทย</text> </g>
          <g id="station-path-223" data-name="station-path">
            <circle cx="847.06" cy="634.08" r="3.4" fill="#fff" stroke="#0e6494" stroke-width="1.6" class="station-id-BL19"></circle>
          </g>
        </g>
        <g id="station_BL20" data-name="station" data-station-id="BL20">
          <g id="label-en-224" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(856.02 682.38)" font-size="6" fill="#424143">Phra Ram 9</text> </g>
          <g id="station-path-224" data-name="station-path">
            <circle cx="847.06" cy="681.17" r="3.4" fill="#fff" stroke="#0e6494" stroke-width="1.6" class="station-id-BL20"></circle>
          </g>
          <g id="label-th-224" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(856.02 682.38)" font-size="6" fill="#424143">พระราม 9</text> </g>
        </g>


        <g id="station_BL23" data-name="station" data-station-id="BL23">
          <g id="label-en-227" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(856.39 870.22)" font-size="6" fill="#424143">QSNCC</text> </g>
          <g id="label-th-227" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(856.39 870.23)" font-size="6" fill="#424143">ศูนย์ฯ สิริกิติ์</text> </g>
          <g id="station-path-227" data-name="station-path">
            <circle cx="847.06" cy="866.83" r="3.4" fill="#fff" stroke="#0e6494" stroke-width="1.6" class="station-id-BL23"></circle>
          </g>
        </g>
        <g id="station_BL24" data-name="station" data-station-id="BL24">
          <g id="label-en-228" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(793.04 865.03)" font-size="6" fill="#424143">Khlong Toei</text> </g>
          <g id="label-th-228" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(799.23 865.03)" font-size="6" fill="#424143">คลองเตย</text> </g>
          <g id="station-path-228" data-name="station-path">
            <circle cx="809.12" cy="872.65" r="3.4" fill="#fff" stroke="#0e6494" stroke-width="1.6" class="station-id-BL24"></circle>
          </g>
        </g>
        <g id="station_BL25" data-name="station" data-station-id="BL25">
          <g id="label-en-229" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(722.99 865.03)" font-size="6" fill="#424143">Lumphini</text> </g>
          <g id="label-th-229" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(727.38 865.03)" font-size="6" fill="#424143">ลุมพินี</text> </g>
          <g id="station-path-229" data-name="station-path">
            <circle cx="733.72" cy="872.65" r="3.4" fill="#fff" stroke="#0e6494" stroke-width="1.6" class="station-id-BL25"></circle>
          </g>
        </g>

        <g id="station_BL27" data-name="station" data-station-id="BL27">
          <g id="label-en-231" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(636.31 865.03)" font-size="6" fill="#424143">Sam Yan</text> </g>
          <g id="label-th-231" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(637.97 865.03)" font-size="6" fill="#424143">สามย่าน</text> </g>
          <g id="station-path-231" data-name="station-path">
            <circle cx="646.25" cy="872.65" r="3.4" fill="#fff" stroke="#0e6494" stroke-width="1.6" class="station-id-BL27"></circle>
          </g>
        </g>
        <g id="station_BL28" data-name="station" data-station-id="BL28">
          <g id="label-en-232" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(586.51 865.03)" font-size="6" fill="#424143">Hua Lamphong</text> </g>
          <g id="label-th-232" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(586.51 865.03)" font-size="6" fill="#424143">หัวลำโพง</text> </g>
          <g id="station-path-232" data-name="station-path">
            <circle cx="606.05" cy="872.65" r="3.4" fill="#fff" stroke="#0e6494" stroke-width="1.6" class="station-id-BL28"></circle>
          </g>
        </g>
        <g id="station_BL29" data-name="station" data-station-id="BL29">
          <g id="label-en-233" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(546.16 884.65)" font-size="6" fill="#424143">Wat Mangkon</text> </g>
          <g id="label-th-233" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(546.16 884.65)" font-size="6" fill="#424143">วัดมังกร</text> </g>
          <g id="station-path-233" data-name="station-path">
            <circle cx="565.46" cy="872.65" r="3.4" fill="#fff" stroke="#0e6494" stroke-width="1.6" class="station-id-BL29"></circle>
          </g>
        </g>
        <g id="station_BL30" data-name="station" data-station-id="BL30">
          <g id="label-en-234" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(522.79 864.6)" font-size="6" fill="#424143">Sam Yot</text> </g>
          <g id="label-th-234" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(523.47 864.6)" font-size="6" fill="#424143">สามยอด</text> </g>
          <g id="station-path-234" data-name="station-path">
            <circle cx="532.14" cy="872.65" r="3.4" fill="#fff" stroke="#0e6494" stroke-width="1.6" class="station-id-BL30"></circle>
          </g>
        </g>
        <g id="station_BL31" data-name="station" data-station-id="BL31">
          <g id="label-en-235" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(477.34 906.2)" font-size="6" fill="#424143">Sanam Chai</text> </g>
          <g id="label-th-235" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(477.17 906.2)" font-size="6" fill="#424143">สนามไชย</text> </g>
          <g id="station-path-235" data-name="station-path">
            <circle cx="476.81" cy="895.15" r="3.4" fill="#fff" stroke="#0e6494" stroke-width="1.6" class="station-id-BL31"></circle>
          </g>
        </g>
        <g id="station_BL32" data-name="station" data-station-id="BL32">
          <g id="label-th-236" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(428.22 928.01)" font-size="6" fill="#424143">อิสรภาพ</text> </g>
          <g id="label-en-236" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(424.99 928.01)" font-size="6" fill="#424143">Itsaraphap</text> </g>
          <g id="station-path-236" data-name="station-path">
            <circle cx="438.31" cy="918.11" r="3.4" fill="#fff" stroke="#0e6494" stroke-width="1.6" class="station-id-BL32"></circle>
          </g>
        </g>
        <g id="station_BL33" data-name="station" data-station-id="BL33">
          <g id="label-en-237" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(361.36 910.25)" font-size="6" fill="#424143">Bang Phai</text> </g>
          <g id="label-th-237" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(366.62 910.25)" font-size="6" fill="#424143">บางไผ่</text> </g>
          <g id="station-path-237" data-name="station-path">
            <circle cx="372.88" cy="918.11" r="3.4" fill="#fff" stroke="#0e6494" stroke-width="1.6" class="station-id-BL33"></circle>
          </g>
        </g>

        <g id="station_BL35" data-name="station" data-station-id="BL35">
          <g id="label-en-239" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(275.9 910.25)" font-size="6" fill="#424143">Phetkasem 48</text> </g>
          <g id="label-th-239" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(277.9 910.25)" font-size="6" fill="#424143">เพชรเกษม48</text> </g>
          <g id="station-path-239" data-name="station-path">
            <circle cx="296.62" cy="917.51" r="3.4" fill="#fff" stroke="#0e6494" stroke-width="1.6" class="station-id-BL35"></circle>
          </g>
        </g>
        <g id="station_BL36" data-name="station" data-station-id="BL36">
          <g id="label-en-240" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(248.45 929.63)" font-size="6" fill="#424143">Phasi Charoen</text> </g>
          <g id="label-th-240" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(254.45 929.63)" font-size="6" fill="#424143">ภาษีเจริญ</text> </g>
          <g id="station-path-240" data-name="station-path">
            <circle cx="295.06" cy="969.97" r="3.41" transform="translate(-716.97 1152.45) rotate(-86.47)" fill="#fff" stroke="#0e6494" stroke-miterlimit="4.01" stroke-width="1.6" class="station-id-BL36"></circle>
          </g>
        </g>
        <g id="station_BL37" data-name="station" data-station-id="BL37">
          <g id="label-en-241" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(222.14 910.25)" font-size="6" fill="#424143">Bang Khae</text> </g>
          <g id="label-th-241" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(229.22 909.63)" font-size="6" fill="#424143">บางแค</text> </g>
          <g id="station-path-241" data-name="station-path">
            <circle cx="235.96" cy="917.51" r="3.4" fill="#fff" stroke="#0e6494" stroke-width="1.6" class="station-id-BL37"></circle>
          </g>
        </g>
        <g id="station_BL38" data-name="station" data-station-id="BL38">
          <g id="label-en-242" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(192.61 929.63)" font-size="6" fill="#424143">Lak Song</text> </g>
          <g id="label-th-242" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(197.49 909.64)" font-size="6" fill="#424143">หลักสอง</text> </g>
          <g id="station-path-242" data-name="station-path">
            <circle cx="206.01" cy="917.51" r="3.4" fill="#fff" stroke="#0e6494" stroke-width="1.6" class="station-id-BL38"></circle>
          </g>
        </g>
      </g>
    </g>

    <g id="bts-silom" data-name="train-line" data-status="open">
      <g id="track-13" data-name="track">
        <path id="Line-21" d="M362.21,976.66l76.5,76.5a7.55,7.55,0,0,0,5.34,2.21H672.61a7.51,7.51,0,0,0,5.33-2.21l49.29-49.29a7.55,7.55,0,0,0,2.21-5.34V882.17a7.56,7.56,0,0,0-7.54-7.54h-54" transform="translate(-25.75 -52.38)" fill="none" stroke="#046461" stroke-miterlimit="10" stroke-width="4"></path>
      </g>
      <g id="station_W1" data-name="station" data-station-id="W1">
        <g id="label-en-271" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(620 832.69)" font-size="6" fill="#424143">National Stadium</text> </g>
        <g id="label-th-271" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(620 832.69)" font-size="6" fill="#424143">สนามกีฬาแห่งชาติ</text> </g>
        <g id="station-path-271" data-name="station-path">
          <circle cx="642.25" cy="822.03" r="3.4" fill="#fff" stroke="#046461" stroke-width="1.6" class="station-id-W1"></circle>
        </g>
      </g>

      <g id="station_S1" data-name="station" data-station-id="S1">
        <g id="label-en-273" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(711.39 834.86)" font-size="6" fill="#424143">Ratchadamri</text> </g>
        <g id="label-th-273" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(711.39 834.86)" font-size="6" fill="#424143">ราชดำริ</text> </g>
        <g id="station-path-273" data-name="station-path">
          <circle cx="703.59" cy="832.65" r="3.4" fill="#fff" stroke="#046461" stroke-width="1.6" class="station-id-S1"></circle>
        </g>
      </g>

      <g id="station_S3" data-name="station" data-station-id="S3">
        <g id="label-en-275" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(660.51 930.95)" font-size="6" fill="#424143">Chong Nonsi</text> </g>
        <g id="label-th-275" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(672.29 930.95)" font-size="6" fill="#424143">ช่องนนทรี</text> </g>
        <g id="station-path-275" data-name="station-path">
          <circle cx="703.7" cy="929.04" r="3.4" fill="#fff" stroke="#046461" stroke-width="1.6" class="station-id-S3"></circle>
        </g>
      </g>
      <g id="station_S4" data-name="station" data-station-id="S4">
        <g id="label-en-276" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(647.66 967.23)" font-size="6" fill="#424143">Saint Louis</text> </g>
        <g id="label-th-276" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(641.25 967.23)" font-size="6" fill="#424143">เซนต์หลุยส์</text> </g>
        <g id="station-path-276" data-name="station-path">
          <circle cx="687.29" cy="966.22" r="3.4" fill="#fff" stroke="#046461" stroke-width="1.6" class="station-id-S4"></circle>
        </g>
      </g>
      <g id="station_S5" data-name="station" data-station-id="S5">
        <g id="label-en-277" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(634.79 989.33)" font-size="6" fill="#424143">Surasak</text> </g>
        <g id="label-th-277" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(638.08 989.33)" font-size="6" fill="#424143">สุรศักดิ์</text> </g>
        <g id="station-path-277" data-name="station-path">
          <circle cx="664.57" cy="988.75" r="3.4" fill="#fff" stroke="#046461" stroke-width="1.6" class="station-id-S5"></circle>
        </g>
      </g>
      <g id="station_S6" data-name="station" data-station-id="S6">
        <g id="label-en-278" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(615.65 1015.65)" font-size="6" fill="#424143">Saphan Taksin</text> </g>
        <g id="label-th-278" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(609.79 1015.65)" font-size="6" fill="#424143">สะพานตากสิน</text> </g>
        <g id="station-path-278" data-name="station-path">
          <circle cx="624.01" cy="1003.04" r="3.4" fill="#fff" stroke="#046461" stroke-width="1.6" class="station-id-S6"></circle>
        </g>
      </g>

      <g id="station_S8" data-name="station" data-station-id="S8">
        <g id="label-en-280" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(517.82 1015.65)" font-size="6" fill="#424143">Wongwian Yai</text> </g>
        <g id="label-th-280" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(521.72 1015.65)" font-size="6" fill="#424143">วงเวียนใหญ่</text> </g>
        <g id="station-path-280" data-name="station-path">
          <circle cx="533.78" cy="1003.04" r="3.4" fill="#fff" stroke="#046461" stroke-width="1.6" class="station-id-S8"></circle>
        </g>
      </g>
      <g id="station_S9" data-name="station" data-station-id="S9">
        <g id="label-en-281" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(474.82 1015.65)" font-size="6" fill="#424143">Pho Nimit</text> </g>
        <g id="label-th-281" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(476.15 1015.65)" font-size="6" fill="#424143">โพธิ์นิมิตร</text> </g>
        <g id="station-path-281" data-name="station-path">
          <circle cx="486.19" cy="1003.04" r="3.4" fill="#fff" stroke="#046461" stroke-width="1.6" class="station-id-S9"></circle>
        </g>
      </g>
      <g id="station_S10" data-name="station" data-station-id="S10">
        <g id="label-en-282" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(431.02 1015.71)" font-size="6" fill="#424143">Talat Phlu</text> </g>
        <g id="label-th-282" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(432.17 1015.71)" font-size="6" fill="#424143">ตลาดพลู</text> </g>
        <g id="station-path-282" data-name="station-path">
          <circle cx="443.01" cy="1003.04" r="3.4" fill="#fff" stroke="#046461" stroke-width="1.6" class="station-id-S10"></circle>
        </g>
      </g>
      <g id="station_S11" data-name="station" data-station-id="S11">
        <g id="label-en-283" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(386.61 965.5)" font-size="6" fill="#424143">Wutthakat</text> </g>
        <g id="label-th-283" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(386.61 965.5)" font-size="6" fill="#424143">วุฒากาศ</text> </g>
        <g id="station-path-283" data-name="station-path">
          <circle cx="384.89" cy="973.78" r="3.4" fill="#fff" stroke="#046461" stroke-width="1.6" class="station-id-S11"></circle>
        </g>
      </g>

    </g>
    <g id="bts-sukhumvit" data-name="train-line">
      <g id="bts-sukhumvit-north-extension" data-status="future">
        <g id="track-15" data-name="track">
          <line x1="870.98" y1="138.19" x2="1037.34" y2="138.19" fill="none" stroke="#e0e0df" stroke-miterlimit="10" stroke-width="2"></line>
        </g>
        <g id="station_N28" data-name="station" data-station-id="N28">
          <g id="label-en-285" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1028 129)" font-size="6" fill="#424143">Eastern Outer Ring Road</text> </g>
          <g id="label-th-285" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1028 129)" font-size="6" fill="#424143">วงแหวนรอบนอกตะวันออก</text> </g>
          <g id="station-path-285" data-name="station-path">
            <circle cx="1040.34" cy="138.19" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-N28"></circle>
          </g>
        </g>
        <g id="station_N27" data-name="station" data-station-id="N27">
          <g id="label-en-286" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(985 129)" font-size="6" fill="#424143">Khlong 5</text> </g>
          <g id="label-th-286" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(985 129)" font-size="6" fill="#424143">คลองห้า</text> </g>
          <g id="station-path-286" data-name="station-path">
            <circle cx="994.34" cy="138.19" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-N27"></circle>
          </g>
        </g>
        <g id="station_N26" data-name="station" data-station-id="N26">
          <g id="label-en-287" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(936 129)" font-size="6" fill="#424143">Khlong 4</text> </g>
          <g id="label-th-287" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(936 129)" font-size="6" fill="#424143">คลองสี่</text> </g>
          <g id="station-path-287" data-name="station-path">
            <circle cx="948.18" cy="138.19" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-N26"></circle>
          </g>
        </g>
        <g id="station_N25" data-name="station" data-station-id="N25">
          <g id="label-en-288" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(894 129)" font-size="6" fill="#424143">Khlong 3</text> </g>
          <g id="label-th-288" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(894 129)" font-size="6" fill="#424143">คลองสาม</text> </g>
          <g id="station-path-288" data-name="station-path">
            <circle cx="906.76" cy="138.19" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-N25"></circle>
          </g>
        </g>
      </g>
      <g id="bts-sukhumvit-east-extension" data-status="future">
        <g id="track-16" data-name="track">
          <path id="Line-23" d="M1070 1292L1247.33 1291.9" stroke="#E0E0DF" stroke-width="2" stroke-miterlimit="10"></path>
        </g>
        <g id="station_E24" data-name="station" data-station-id="E24">
          <g id="label-en-340" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1088.71 1283.17)" font-size="6" fill="#E0E0DF">Sawang Khaniwat</text> </g>
          <g id="label-th-340" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1096.25 1283.17)" font-size="6" fill="#424143">สวางคนิวาส</text> </g>
          <g id="station-path-340" data-name="station-path">
            <circle cx="1111.08" cy="1291.48" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-E24"></circle>
          </g>
        </g>
        <g id="station_E25" data-name="station" data-station-id="E25">
          <g id="label-en-289" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1136.85 1283.23)" font-size="6" fill="#424143">Ancient City</text> </g>
          <g id="label-th-289" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1138.05 1283.23)" font-size="6" fill="#424143">เมืองโบราณ</text> </g>
          <g id="station-path-289" data-name="station-path">
            <circle cx="1151.64" cy="1291.31" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-E25"></circle>
          </g>
        </g>
        <g id="station_E26" data-name="station" data-station-id="E26">
          <g id="label-en-290" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1164.23 1303.95)" font-size="6" fill="#424143">Srichan pradit</text> </g>
          <g id="label-th-290" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1164.17 1303.95)" font-size="6" fill="#424143">ศรีจันทร์ประดิษฐ์</text> </g>
          <g id="station-path-290" data-name="station-path">
            <circle cx="1183.25" cy="1291.44" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-E26"></circle>
          </g>
        </g>
        <g id="station_E27" data-name="station" data-station-id="E27">
          <g id="label-en-291" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1206.52 1283.23)" font-size="6" fill="#424143">Bang Pu</text> </g>
          <g id="label-th-291" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1210.73 1283.23)" font-size="6" fill="#424143">บางปู</text> </g>
          <g id="station-path-291" data-name="station-path">
            <circle cx="1216.43" cy="1291.98" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-E27"></circle>
          </g>
        </g>
        <g id="station_E28" data-name="station" data-station-id="E28">
          <g id="label-en-292" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1241.48 1303.95)" font-size="6" fill="#424143">Tamru</text> </g>
          <g id="label-th-292" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1242.65 1303.95)" font-size="6" fill="#424143">ตำหรุ</text> </g>
          <g id="station-path-292" data-name="station-path">
            <circle cx="1249.27" cy="1291.65" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-E28"></circle>
          </g>
        </g>
      </g>
      <g data-status="open">
        <g id="track-14" data-name="track">
          <path id="Line-22" d="M870.25 138.21H811.39C809.6 138.209 807.828 138.562 806.176 139.249C804.523 139.935 803.022 140.942 801.76 142.21L679.38 265.49C676.857 268.032 675.441 271.468 675.44 275.05V798.44C675.453 802.033 676.888 805.475 679.43 808.014C681.973 810.553 685.417 811.982 689.01 811.99H915.42C919.02 812 922.469 813.439 925.01 815.99L1032.88 923.89C1035.43 926.435 1036.87 929.887 1036.88 933.49V1278.32C1036.88 1281.92 1038.31 1285.37 1040.85 1287.91C1043.39 1290.46 1046.84 1291.89 1050.44 1291.89H1070.5" stroke="#69a543" stroke-width="4" stroke-miterlimit="10"></path>
        </g>
        <g id="station_N24" data-name="station" data-station-id="N24">
          <g id="label-en-293" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(860 129)" font-size="6" fill="#424143">Khu Khot</text> </g>
          <g id="label-th-293" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(860 129)" font-size="6" fill="#424143">คูคต</text> </g>
          <g id="station-path-293" data-name="station-path">
            <circle cx="871.22" cy="138.19" r="3.4" fill="#fff" stroke="#69a543" stroke-width="1.6" class="station-id-N24"></circle>
          </g>
        </g>
        <g id="station_N23" data-name="station" data-station-id="N23">
          <g id="label-en-294" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(793 129)" font-size="6" fill="#424143">Kor Por Aor Junction</text> </g>
          <g id="label-th-294" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(817.21 129)" font-size="6" fill="#424143">แยกคปอ.</text> </g>
          <g id="station-path-294" data-name="station-path">
            <circle cx="828.26" cy="138.19" r="3.4" fill="#fff" stroke="#69a543" stroke-width="1.6" class="station-id-N23"></circle>
          </g>
        </g>
        <g id="station_N22" data-name="station" data-station-id="N22">
          <g id="label-en-295" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(695 158.5)" font-size="6" fill="#424143">Royal Thai Air Force Museum</text> </g>
          <g id="label-th-295" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(716.7 157.5)" font-size="6" fill="#424143">พิพิธภัณฑ์กองทัพอากาศ</text> </g>
          <g id="station-path-295" data-name="station-path">
            <circle cx="787.6" cy="156.45" r="3.4" fill="#fff" stroke="#69a543" stroke-width="1.6" class="station-id-N22"></circle>
          </g>
        </g>
        <g id="station_N21" data-name="station" data-station-id="N21">
          <g id="label-en-296" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(674 180.5)" font-size="6" fill="#424143">Bhumibol Adulyadej Hospital</text> </g>
          <g id="label-th-296" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(707.9 179.5)" font-size="6" fill="#424143">รพ.ภูมิพลอดุลยเดช</text> </g>
          <g id="station-path-296" data-name="station-path">
            <circle cx="766.02" cy="178.19" r="3.4" fill="#fff" stroke="#69a543" stroke-width="1.6" class="station-id-N21"></circle>
          </g>
        </g>
        <g id="station_N20" data-name="station" data-station-id="N20">
          <g id="label-en-297" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(700 202.5)" font-size="6" fill="#424143">Saphan Mai</text> </g>
          <g id="label-th-297" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(708.94 201.5)" font-size="6" fill="#424143">สะพานใหม่</text> </g>
          <g id="station-path-297" data-name="station-path">
            <circle cx="743.53" cy="200.88" r="3.4" fill="#fff" stroke="#69a543" stroke-width="1.6" class="station-id-N20"></circle>
          </g>
        </g>
        <g id="station_N19" data-name="station" data-station-id="N19">
          <g id="label-en-298" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(692 222.5)" font-size="6" fill="#424143">Sai Yud</text> </g>
          <g id="label-th-298" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(693.24 222.5)" font-size="6" fill="#424143">สายหยุด</text> </g>
          <g id="station-path-298" data-name="station-path">
            <circle cx="723.19" cy="221.37" r="3.4" fill="#fff" stroke="#69a543" stroke-width="1.6" class="station-id-N19"></circle>
          </g>
        </g>
        <g id="station_N18" data-name="station" data-station-id="N18">
          <g id="label-en-299" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(643 243.5)" font-size="6" fill="#424143">Phahon Yothin 59</text> </g>
          <g id="label-th-299" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(660.85 243.5)" font-size="6" fill="#424143">พหลโยธิน 59</text> </g>
          <g id="station-path-299" data-name="station-path">
            <circle cx="702.55" cy="241.54" r="3.4" fill="#fff" stroke="#69a543" stroke-width="1.6" class="station-id-N18"></circle>
          </g>
        </g>

        <g id="station_N16" data-name="station" data-station-id="N16">
          <g id="label-en-301" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(604 304.3)" font-size="6" fill="#424143">11th Infantry Regiment</text> </g>
          <g id="label-th-301" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(625 304.5)" font-size="6" fill="#424143">กรมทหารราบที่ 11</text> </g>
          <g id="station-path-301" data-name="station-path">
            <circle cx="675.5" cy="302.46" r="3.4" fill="#fff" stroke="#69a543" stroke-width="1.6" class="station-id-N16"></circle>
          </g>
        </g>
        <g id="station_N15" data-name="station" data-station-id="N15">
          <g id="label-en-302" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(641 337.5)" font-size="6" fill="#424143">Bang Bua</text> </g>
          <g id="label-th-302" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(652 337.5)" font-size="6" fill="#424143">บางบัว</text> </g>
          <g id="station-path-302" data-name="station-path">
            <circle cx="675.5" cy="335.94" r="3.4" fill="#fff" stroke="#69a543" stroke-width="1.6" class="station-id-N15"></circle>
          </g>
        </g>
        <g id="station_N14" data-name="station" data-station-id="N14">
          <g id="label-en-303" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(597 370.5)" font-size="6" fill="#424143">Royal Forest Department</text> </g>
          <g id="label-th-303" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(646 370.5)" font-size="6" fill="#424143">กรมป่าไม้</text> </g>
          <g id="station-path-303" data-name="station-path">
            <circle cx="675.5" cy="368.21" r="3.4" fill="#fff" stroke="#69a543" stroke-width="1.6" class="station-id-N14"></circle>
          </g>
        </g>
        <g id="station_N13" data-name="station" data-station-id="N13">
          <g id="label-en-304" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(610 403.5)" font-size="6" fill="#424143">Kasetsart University</text> </g>
          <g id="label-th-304" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(646 403.5)" font-size="6" fill="#424143">ม.เกษตร</text> </g>
          <g id="station-path-304" data-name="station-path">
            <circle cx="675.5" cy="401.3" r="3.4" fill="#fff" stroke="#69a543" stroke-width="1.6" class="station-id-N13"></circle>
          </g>
        </g>
        <g id="station_N12" data-name="station" data-station-id="N12">
          <g id="label-en-305" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(630 430.8)" font-size="6" fill="#424143">Sena Nikhom</text> </g>
          <g id="label-th-305" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(645 430.8)" font-size="6" fill="#424143">เสนานิคม</text> </g>
          <g id="station-path-305" data-name="station-path">
            <circle cx="675.5" cy="429.09" r="3.4" fill="#fff" stroke="#69a543" stroke-width="1.6" class="station-id-N12"></circle>
          </g>
        </g>
        <g id="station_N11" data-name="station" data-station-id="N11">
          <g id="label-en-306" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(630 462.5)" font-size="6" fill="#424143">Ratchayothin</text> </g>
          <g id="label-th-306" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(649 462.5)" font-size="6" fill="#424143">รัชโยธิน</text> </g>
          <g id="station-path-306" data-name="station-path">
            <circle cx="675.5" cy="460.73" r="3.4" fill="#fff" stroke="#69a543" stroke-width="1.6" class="station-id-N11"></circle>
          </g>
        </g>
        <g id="station_N10" data-name="station" data-station-id="N10">
          <g id="station-path-307" data-name="station-path">
            <circle cx="675.5" cy="494.78" r="3.4" fill="#fff" stroke="#69a543" stroke-width="1.6" class="station-id-N10"></circle>
          </g>
          <g id="label-th-307" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(639 496.5)" font-size="6" fill="#424143">พลโยธิน 24</text> </g>
          <g id="label-en-307" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(624.14 496.5)" font-size="6" fill="#424143">Phaholyothin 24</text> </g>
        </g>
        <g id="station_N9" data-name="station" data-station-id="N9">
          <g id="label-en-308" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(607 530.83)" font-size="6" fill="#424143">Ladphrao Intersection</text> </g>
          <g id="label-th-308" data-name="label-th"><text text-rendering="geometricPrecision" transform="translate(627 530.83)" font-size="6" fill="#424143">ห้าแยกลาดพร้าว</text> </g>
          <g id="station-path-308" data-name="station-path">
            <circle cx="675.5" cy="529.56" r="3.4" fill="#fff" stroke="#69a543" stroke-width="1.6" class="station-id-N9"></circle>
          </g>
        </g>

        <g id="station_N7" data-name="station" data-station-id="N7">
          <g id="label-en-310" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(683.87 600.87)" font-size="6" fill="#424143">Saphan Khwai</text> </g>
          <g id="label-th-310" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(683.87 600.87)" font-size="6" fill="#424143">สะพานควาย</text> </g>
          <g id="station-path-310" data-name="station-path">
            <circle cx="675.5" cy="599.11" r="3.4" fill="#fff" stroke="#69a543" stroke-width="1.6" class="station-id-N7"></circle>
          </g>
        </g>
        <g id="station_N5" data-name="station" data-station-id="N5">
          <g id="label-en-311" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(683.99 641.49)" font-size="6" fill="#424143">Ari</text> </g>
          <g id="label-th-311" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(683.99 641.49)" font-size="6" fill="#424143">อารีย์</text> </g>
          <g id="station-path-311" data-name="station-path">
            <circle cx="675.5" cy="639.47" r="3.4" fill="#fff" stroke="#69a543" stroke-width="1.6" class="station-id-N5"></circle>
          </g>
        </g>
        <g id="station_N4" data-name="station" data-station-id="N4">
          <g id="label-en-312" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(683.87 667.23)" font-size="6" fill="#424143">Sanam Pao</text> </g>
          <g id="label-th-312" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(683.87 667.23)" font-size="6" fill="#424143">สนามเป้า</text> </g>
          <g id="station-path-312" data-name="station-path">
            <circle cx="675.5" cy="665.05" r="3.4" fill="#fff" stroke="#69a543" stroke-width="1.6" class="station-id-N4"></circle>
          </g>
        </g>
        <g id="station_N3" data-name="station" data-station-id="N3">
          <g id="label-en-313" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(683.87 694.47)" font-size="6" fill="#424143">Victory Monument</text> </g>
          <g id="label-th-313" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(683.87 694.47)" font-size="6" fill="#424143">อนุสาวรีย์ชัยสมรภูมิ</text> </g>
          <g id="station-path-313" data-name="station-path">
            <circle cx="675.5" cy="692.63" r="3.4" fill="#fff" stroke="#69a543" stroke-width="1.6" class="station-id-N3"></circle>
          </g>
        </g>

        <g id="station_N1" data-name="station" data-station-id="N1">
          <g id="label-en-315" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(683.18 770.41)" font-size="6" fill="#424143">Ratchathewi</text> </g>
          <g id="label-th-315" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(683.18 770.41)" font-size="6" fill="#424143">ราชเทวี</text> </g>
          <g id="station-path-315" data-name="station-path">
            <circle cx="675.5" cy="768.68" r="3.4" fill="#fff" stroke="#69a543" stroke-width="1.6" class="station-id-N1"></circle>
          </g>
        </g>

        <g id="station_E1" data-name="station" data-station-id="E1">
          <g id="label-en-317" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(719.08 804.31)" font-size="6" fill="#424143">Chit Lom</text> </g>
          <g id="label-th-317" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(722.71 804.31)" font-size="6" fill="#424143">ชิดลม</text> </g>
          <g id="station-path-317" data-name="station-path">
            <circle cx="728.53" cy="811.49" r="3.4" fill="#fff" stroke="#69a543" stroke-width="1.6" class="station-id-E1"></circle>
          </g>
        </g>
        <g id="station_E2" data-name="station" data-station-id="E2">
          <g id="label-en-318" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(748.95 804.25)" font-size="6" fill="#424143">Phloen Chit</text> </g>
          <g id="label-th-318" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(753.87 804.25)" font-size="6" fill="#424143">เพลินจิต</text> </g>
          <g id="station-path-318" data-name="station-path">
            <circle cx="763.82" cy="811.49" r="3.4" fill="#fff" stroke="#69a543" stroke-width="1.6" class="station-id-E2"></circle>
          </g>
        </g>
        <g id="station_E3" data-name="station" data-station-id="E3">
          <g id="label-en-319" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(792.97 804.19)" font-size="6" fill="#424143">Nana</text> </g>
          <g id="label-th-319" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(793.2 804.19)" font-size="6" fill="#424143">นานา</text> </g>
          <g id="station-path-319" data-name="station-path">
            <circle cx="799.5" cy="811.49" r="3.4" fill="#fff" stroke="#69a543" stroke-width="1.6" class="station-id-E3"></circle>
          </g>
        </g>

        <g id="station_E5" data-name="station" data-station-id="E5">
          <g id="label-en-321" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(870.38 804.13)" font-size="6" fill="#424143">Phrom Phong</text> </g>
          <g id="label-th-321" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(875.13 804.13)" font-size="6" fill="#424143">พร้อมพงษ์</text> </g>
          <g id="station-path-321" data-name="station-path">
            <circle cx="888.01" cy="811.49" r="3.4" fill="#fff" stroke="#69a543" stroke-width="1.6" class="station-id-E5"></circle>
          </g>
        </g>
        <g id="station_E6" data-name="station" data-station-id="E6">
          <g id="label-en-322" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(935.25 819.28)" font-size="6" fill="#424143">Thong Lo</text> </g>
          <g id="label-th-322" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(935.25 819.28)" font-size="6" fill="#424143">ทองหล่อ</text> </g>
          <g id="station-path-322" data-name="station-path">
            <circle cx="927.76" cy="819.28" r="3.4" fill="#fff" stroke="#69a543" stroke-width="1.6" class="station-id-E6"></circle>
          </g>
        </g>
        <g id="station_E7" data-name="station" data-station-id="E7">
          <g id="label-en-323" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(955.6 839.63)" font-size="6" fill="#424143">Ekkamai</text> </g>
          <g id="label-th-323" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(955.6 839.63)" font-size="6" fill="#424143">เอกมัย</text> </g>
          <g id="station-path-323" data-name="station-path">
            <circle cx="948.29" cy="839.63" r="3.4" fill="#fff" stroke="#69a543" stroke-width="1.6" class="station-id-E7"></circle>
          </g>
        </g>
        <g id="station_E8" data-name="station" data-station-id="E8">
          <g id="label-en-324" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(982.62 865.83)" font-size="6" fill="#424143">Pra Khanong</text> </g>
          <g id="label-th-324" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(982.62 865.83)" font-size="6" fill="#424143">พระโขนง</text> </g>
          <g id="station-path-324" data-name="station-path">
            <circle cx="975.3" cy="866.83" r="3.4" fill="#fff" stroke="#69a543" stroke-width="1.6" class="station-id-E8"></circle>
          </g>
        </g>
        <g id="station_E9" data-name="station" data-station-id="E9">
          <g id="label-en-325" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1007.68 889.9)" font-size="6" fill="#424143">On Nut</text> </g>
          <g id="label-th-325" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1007.68 889.9)" font-size="6" fill="#424143">อ่อนนุช</text> </g>
          <g id="station-path-325" data-name="station-path">
            <circle cx="1000.37" cy="890.9" r="3.4" fill="#fff" stroke="#69a543" stroke-width="1.6" class="station-id-E9"></circle>
          </g>
        </g>
        <g id="station_E10" data-name="station" data-station-id="E10">
          <g id="label-en-326" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1029.86 912.08)" font-size="6" fill="#424143">Bang Chak</text> </g>
          <g id="label-th-326" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1029.86 912.08)" font-size="6" fill="#424143">บางจาก</text> </g>
          <g id="station-path-326" data-name="station-path">
            <circle cx="1022.55" cy="913.08" r="3.4" fill="#fff" stroke="#69a543" stroke-width="1.6" class="station-id-E10"></circle>
          </g>
        </g>
        <g id="station_E11" data-name="station" data-station-id="E11">
          <g id="label-en-327" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1043.96 944.41)" font-size="6" fill="#424143">Punnawithi</text> </g>
          <g id="label-th-327" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1043.96 944.41)" font-size="6" fill="#424143">ปุณณวิถี</text> </g>
          <g id="station-path-327" data-name="station-path">
            <circle cx="1037" cy="942.5" r="3.4" fill="#fff" stroke="#69a543" stroke-width="1.6" class="station-id-E11"></circle>
          </g>
        </g>
        <g id="station_E12" data-name="station" data-station-id="E12">
          <g id="label-en-328" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1043.96 974.55)" font-size="6" fill="#424143">Udom Suk</text> </g>
          <g id="label-th-328" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1043.96 974.55)" font-size="6" fill="#424143">อุดมสุข</text> </g>
          <g id="station-path-328" data-name="station-path">
            <circle cx="1037" cy="973.5" r="3.4" fill="#fff" stroke="#69a543" stroke-width="1.6" class="station-id-E12"></circle>
          </g>
        </g>
        <g id="station_E13" data-name="station" data-station-id="E13">
          <g id="station-path-329" data-name="station-path">
            <circle cx="1037" cy="1006.5" r="3.4" fill="#fff" stroke="#69a543" stroke-width="1.6" class="station-id-E13"></circle>
          </g>
          <g id="label-en-329" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1043.96 1008.46)" font-size="6" fill="#424143">Bang Na</text> </g>
          <g id="label-th-329" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1043.96 1008.46)" font-size="6" fill="#424143">บางนา</text> </g>
        </g>
        <g id="station_E14" data-name="station" data-station-id="E14">
          <g id="label-en-330" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1043.96 1040.37)" font-size="6" fill="#424143">Bearing </text> </g>
          <g id="label-th-330" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1043.96 1040.98)" font-size="6" fill="#424143">แบริ่ง</text> </g>
          <g id="station-path-330" data-name="station-path">
            <circle cx="1037" cy="1039.46" r="3.4" fill="#fff" stroke="#69a543" stroke-width="1.6" class="station-id-E14"></circle>
          </g>
        </g>

        <g id="station_E16" data-name="station" data-station-id="E16">
          <g id="station-path-332" data-name="station-path">
            <circle cx="1037" cy="1091.46" r="3.4" fill="#fff" stroke="#69a543" stroke-width="1.6" class="station-id-E16"></circle>
          </g>
          <g id="label-en-332" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1043.96 1092.67)" font-size="6" fill="#424143">Pu Chao</text> </g>
          <g id="label-th-332" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1043.96 1092.67)" font-size="6" fill="#424143">ปู่เจ้า</text> </g>
        </g>
        <g id="station_E17" data-name="station" data-station-id="E17">
          <g id="label-en-333" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1043.96 1119.8)" font-size="6" fill="#424143">Chang Erawan</text> </g>
          <g id="label-th-333" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1043.96 1119.8)" font-size="6" fill="#424143">ช้างเอราวัณ</text> </g>
          <g id="station-path-333" data-name="station-path">
            <circle cx="1037" cy="1117.77" r="3.4" fill="#fff" stroke="#69a543" stroke-width="1.6" class="station-id-E17"></circle>
          </g>
        </g>
        <g id="station_E18" data-name="station" data-station-id="E18">
          <g id="label-en-334" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1043.91 1150.91)" font-size="6" fill="#424143">Royal Thai Naval Academy</text> </g>
          <g id="label-th-334" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1044.01 1150.91)" font-size="6" fill="#424143">โรงเรียนนายเรือ</text> </g>
          <g id="station-path-334" data-name="station-path">
            <circle cx="1037" cy="1148.77" r="3.4" fill="#fff" stroke="#69a543" stroke-width="1.6" class="station-id-E18"></circle>
          </g>
        </g>
        <g id="station_E19" data-name="station" data-station-id="E19">
          <g id="label-en-335" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1043.96 1179.63)" font-size="6" fill="#424143">Pak Nam</text> </g>
          <g id="label-th-335" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1043.96 1179.63)" font-size="6" fill="#424143">ปากน้ำ</text> </g>
          <g id="station-path-335" data-name="station-path">
            <circle cx="1037" cy="1177.77" r="3.4" fill="#fff" stroke="#69a543" stroke-width="1.6" class="station-id-E19"></circle>
          </g>
        </g>
        <g id="station_E20" data-name="station" data-station-id="E20">
          <g id="label-en-336" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1043.96 1209.93)" font-size="6" fill="#424143">Srinagarindra</text> </g>
          <g id="label-th-336" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1043.96 1209.93)" font-size="6" fill="#424143">ศรีนครินทร์</text> </g>
          <g id="station-path-336" data-name="station-path">
            <circle cx="1037" cy="1207.77" r="3.4" fill="#fff" stroke="#69a543" stroke-width="1.6" class="station-id-E20"></circle>
          </g>
        </g>
        <g id="station_E21" data-name="station" data-station-id="E21">
          <g id="label-en-337" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1043.96 1239.46)" font-size="6" fill="#424143">Phraek Sa</text> </g>
          <g id="label-th-337" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1043.96 1239.46)" font-size="6" fill="#424143">แพรกษา</text> </g>
          <g id="station-path-337" data-name="station-path">
            <circle cx="1036.86" cy="1238.25" r="3.4" fill="#fff" stroke="#69a543" stroke-width="1.6" class="station-id-E21"></circle>
          </g>
        </g>
        <g id="station_E22" data-name="station" data-station-id="E22">
          <g id="label-en-338" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1043.96 1270)" font-size="6" fill="#424143">Sai Luat</text> </g>
          <g id="label-th-338" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1043.96 1270)" font-size="6" fill="#424143">สายลวด</text> </g>
          <g id="station-path-338" data-name="station-path">
            <circle cx="1037.15" cy="1268.17" r="3.4" fill="#fff" stroke="#69a543" stroke-width="1.6" class="station-id-E22"></circle>
          </g>
        </g>
        <g id="station_E23" data-name="station" data-station-id="E23">
          <g id="label-en-339" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1062.78 1283.68)" font-size="6" fill="#424143">Kheha</text> </g>
          <g id="label-th-339" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1064.11 1283.68)" font-size="6" fill="#424143">เคหะฯ</text> </g>
          <g id="station-path-339" data-name="station-path">
            <circle cx="1071" cy="1291.48" r="3.4" fill="#fff" stroke="#69a543" stroke-width="1.6" class="station-id-E23"></circle>
          </g>
        </g>
      </g>
    </g>
    <g id="airport-link" data-name="train-line">
      <g id="airport-link-extension" data-status="future">
        <g id="track-17" data-name="track">
          <path d="M625.43,254.59V779.64a1.88,1.88,0,0,0,1.88,1.88h0l73.88.25" transform="translate(-25.75 -52.38)" fill="none" stroke="#e0e0df" stroke-miterlimit="10" stroke-width="2"></path>
        </g>

        <g id="station_A10" data-name="station" data-station-id="A10">
          <g id="label-en-342" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(608.49 206.11)" font-size="6" fill="#424143">Don Mueang</text> </g>
          <g id="label-th-342" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(608.49 206.11)" font-size="6" fill="#424143">ดอนเมือง</text> </g>
          <g id="station-path-342" data-name="station-path">
            <circle cx="599.61" cy="204.9" r="3.4" fill="#fff" stroke="#e0e0df" stroke-width="1.6" class="station-id-A10"></circle>
          </g>
        </g>
      </g>
      <g data-status="open">
        <g id="track-18" data-name="track">
          <path id="Line-12" d="M701.19,781.77l596.32-.25a3,3,0,0,1,3,3v31.85" transform="translate(-25.75 -52.38)" fill="none" stroke="#B21617" stroke-miterlimit="10" stroke-width="4"></path>
        </g>
        <g id="station_A1" data-name="station" data-station-id="A1">
          <g id="label-en-343" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1283.45 763.73)" font-size="6" fill="#424143">Suvarnnabhumi</text> </g>
          <g id="label-th-343" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1283.45 763.73)" font-size="6" fill="#424143">สุวรรณภูมิ</text> </g>
          <g id="station-path-343" data-name="station-path">
            <circle cx="1274.73" cy="762.52" r="3.4" fill="#fff" stroke="#B21617" stroke-width="1.6" class="station-id-A1"></circle>
          </g>
          <g id="suvarnnabhumi-airport" data-name="airport" transform="translate(1263.45 768)">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M2.43668 15.4907C2.43814 14.9003 2.77359 14.3232 3.31998 13.6772L0.160311 11.6792C-0.0389073 11.5927 -0.0345127 11.4711 0.0812099 11.3276L0.750644 10.7563C0.872226 10.6816 1.00113 10.6494 1.14029 10.6875L5.03971 11.3466L8.28873 7.82808L0.703769 2.69673C0.511874 2.58394 0.495761 2.4565 0.693515 2.30855L1.78775 1.4355L11.6754 4.21431L14.5963 1.09126C15.5763 0.243116 16.5285 -0.136278 17.2594 0.0438976C17.6623 0.143507 17.8044 0.263624 17.9289 0.641554C18.1706 1.38276 17.7956 2.37886 16.9093 3.40425L13.7863 6.32515L16.5651 16.2128L15.6921 17.3071C15.5441 17.5034 15.4167 17.4873 15.3039 17.2968L10.1711 9.71333L6.6525 12.9609L7.31168 16.8603C7.34976 16.998 7.319 17.1269 7.24283 17.25L6.67154 17.9194C6.52945 18.0351 6.40641 18.0395 6.31998 17.8403L4.32193 14.6806C3.67301 15.2285 3.09586 15.5639 2.5026 15.5639C2.4484 15.5625 2.43668 15.5434 2.43668 15.4907Z" fill="#424143"></path>
          </g>
        </g>
        <g id="station_A2" data-name="station" data-station-id="A2">
          <g id="label-en-344" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1222.81 720.64)" font-size="6" fill="#424143">Lat Krabang</text> </g>
          <g id="label-th-344" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1225.94 720.64)" font-size="6" fill="#424143">ลาดกระบัง</text> </g>
          <g id="station-path-344" data-name="station-path">
            <circle cx="1236.52" cy="729.15" r="3.4" fill="#fff" stroke="#B21617" stroke-width="1.6" class="station-id-A2"></circle>
          </g>
        </g>
        <g id="station_A3" data-name="station" data-station-id="A3">
          <g id="label-en-345" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1171.22 720.64)" font-size="6" fill="#424143">Ban Thap Chang</text> </g>
          <g id="label-th-345" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1178.94 720.64)" font-size="6" fill="#424143">บ้านทับช้าง</text> </g>
          <g id="station-path-345" data-name="station-path">
            <circle cx="1189.86" cy="729.15" r="3.4" fill="#fff" stroke="#B21617" stroke-width="1.6" class="station-id-A3"></circle>
          </g>
        </g>

        <g id="station_A5" data-name="station" data-station-id="A5">
          <g id="label-en-347" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1022.95 721.17)" font-size="6" fill="#424143">Ramkhamhaeng</text> </g>
          <g id="label-th-347" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1030.7 721.17)" font-size="6" fill="#424143">รามคำแหง</text> </g>
          <g id="station-path-347" data-name="station-path">
            <circle cx="1043.47" cy="729.19" r="3.4" fill="#fff" stroke="#B21617" stroke-width="1.6" class="station-id-A5"></circle>
          </g>
        </g>

        <g id="station_A7" data-name="station" data-station-id="A7">
          <g id="label-en-349" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(751.47 723.17)" font-size="6" fill="#424143">Ratchaprarop</text> </g>
          <g id="label-th-349" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(756.08 723.17)" font-size="6" fill="#424143">ราชปรารภ</text> </g>
          <g id="station-path-349" data-name="station-path">
            <circle cx="745.29" cy="729.15" r="3.4" fill="#fff" stroke="#B21617" stroke-width="1.6" class="station-id-A7"></circle>
          </g>
        </g>

      </g>
    </g>
    <g id="transit-stations" data-status="open">
      <g id="station_BL10" data-name="transit" data-station-id="BL10">
        <g id="label-en-214" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(517.37 604.07)" font-size="6" fill="#424143">Tao Poon</text> </g>
        <g id="label-th-214" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(517.37 604.07)" font-size="6" fill="#424143">เตาปูน</text> </g>
        <g data-name="platform-transit-path">
          <g data-name="platform-path">
            <rect x="506.2" y="598.6" width="9" height="17" rx="4.5" fill="white" stroke="#424143"></rect>
          </g>
          <g data-name="station-path">
            <circle class="station-id-BL10" cx="510.6" cy="611" r="2.5" fill="#0E6494"></circle>
          </g>
          <g data-name="station-path">
            <circle class="station-id-PP16" cx="510.6" cy="603.2" r="2.5" fill="#9B54A2"></circle>
          </g>
        </g>
      </g>

      <g id="station_PP15" data-name="transit" data-station-id="PP15">
        <g id="label-en-9" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(518.72 569.21)" font-size="6" fill="#424143">Bang Son</text> </g>
        <g id="label-th-9" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(518.72 569.21)" font-size="6" fill="#424143">บางซ่อน</text> </g>
        <g data-name="platform-transit-path">
          <g data-name="platform-path">
            <rect x="504.094" y="570.657" width="9" height="17" rx="4.5" transform="rotate(-45 504.094 570.657)" fill="white" stroke="#424143"></rect>
          </g>

          <g data-name="station-path">
            <circle class="station-id-PP15" cx="510.3" cy="570.31" r="2.5" fill="#9B54A2"></circle>
          </g>
          <g data-name="station-path">
            <circle class="station-id-RW02" cx="516.13" cy="576.67" r="2.5" fill="#F26163"></circle>
          </g>

        </g>
      </g>

      <g id="station_CEN" data-name="transit" data-station-id="CEN">
        <g id="label-en-214" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(687 804.31)" font-size="6" fill="#424143">Siam</text> </g>
        <g id="label-th-214" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(687 804.31)" font-size="6" fill="#424143">สยาม</text> </g>
        <g data-name="platform-transit-path">
          <g data-name="platform-path">
            <rect x="689" y="808" width="9" height="18" rx="4.5" fill="white" stroke="#424143"></rect>
          </g>
          <g data-name="station-path">
            <circle class="station-id-CEN1-1" cx="693.4" cy="812" r="2.5" fill="#69a543"></circle>
          </g>
          <g data-name="station-path">
            <circle class="station-id-CEN1-2" cx="693.4" cy="822" r="2.5" fill="#046461"></circle>
          </g>
        </g>
      </g>

      <g id="station_N2_A8" data-name="transit" data-station-id="N2">
        <g id="label-en-314" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(682.86 720.91)" font-size="6" fill="#424143">Phaya Thai</text> </g>
        <g id="label-th-314" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(682.86 720.91)" font-size="6" fill="#424143">พญาไท</text> </g>
        <g data-name="platform-transit-path">
          <g data-name="platform-path">
            <rect x="671" y="716.8" width="9" height="17" rx="4.5" fill="white" stroke="#424143"></rect>
          </g>
          <g data-name="station-path">
            <circle class="station-id-N2" cx="675.4" cy="721.1" r="2.5" fill="#69a543" stroke-width="1.6"></circle>
          </g>
          <g data-name="station-path">
            <circle class="station-id-A8" cx="675.4" cy="728.9" r="2.5" fill="#B21617" stroke-width="1.6"></circle>
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
          <g id="label-en-225" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(854.02 714.99)" font-size="6" fill="#424143">Phetchaburi</text> </g>
          <g id="station-path-225" data-name="station-path">


            <circle class="station-id-BL21" cx="846.9" cy="721.1" r="2.5" fill="#0e6494" stroke-width="1.6"></circle>
          </g>
          <g id="label-th-225" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(854.02 714.99)" font-size="6" fill="#424143">เพชรบุรี</text> </g>
        </g>
        <g id="station_A6" data-name="transit-station" data-station-id="A6">
          <g id="label-en-348" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(856.02 740.17)" font-size="6" fill="#424143">Makkasan</text> </g>
          <g id="label-th-348" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(856.02 740.17)" font-size="6" fill="#424143">มักกะสัน</text> </g>
          <g id="station-path-348" data-name="station-path">


            <circle class="station-id-A6" cx="846.9" cy="728.9" r="2.5" fill="#B21617" stroke-width="1.6"></circle>
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
          <g id="label-en-320" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(825.82 804.19)" font-size="6" fill="#424143">Asok</text> </g>
          <g id="label-th-320" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(825.92 804.19)" font-size="6" fill="#424143">อโศก</text> </g>
          <g id="station-path-320" data-name="station-path">



            <circle class="station-id-E4" cx="840.79" cy="812.06" r="2.5" fill="#69a543"></circle>
          </g>
        </g>

        <g id="station_BL22" data-name="transit-station" data-station-id="BL22">
          <g id="label-en-226" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(855.23 827.86)" font-size="6" fill="#424143">Sukhumvit</text> </g>
          <g id="label-th-226" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(855.23 827.86)" font-size="6" fill="#424143">สุขุมวิท</text> </g>
          <g id="station-path-226" data-name="station-path">

            <circle class="station-id-BL22" cx="846.69" cy="817.86" r="2.5" fill="#0e6494"></circle>

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
          <g id="label-en-274" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(665.39 860.86)" font-size="6" fill="#424143">Sala Daeng</text> </g>
          <g id="label-th-274" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(673.39 860.86)" font-size="6" fill="#424143">ศาลาแดง</text></g>
          <g id="station-path-274" data-name="station-path">


            <circle class="station-id-S2" cx="703.4" cy="865.9" r="2.5" fill="#046461"></circle>
          </g>
        </g>

        <g id="station_BL26" data-name="transit-station" data-station-id="BL26">
          <g id="label-en-230" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(678.72 883.9)" font-size="6" fill="#424143">Si Lom</text> </g>
          <g id="label-th-230" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(682.24 883.9)" font-size="6" fill="#424143">สีลม</text> </g>
          <g id="station-path-230" data-name="station-path">


            <circle class="station-id-BL26" cx="697.4" cy="872" r="2.5" fill="#0e6494"></circle>

          </g>
        </g>





      </g>
      <g id="station_G1_S7" data-name="transit" data-station-id="S7">
        <g id="label-en-279" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(567.29 1015.65)" font-size="6" fill="#424143">Krung Thonburi</text> </g>
        <g id="label-th-279" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(577.4 1015.65)" font-size="6" fill="#424143">กรุงธนบุรี</text> </g>
        <g data-name="platform-transit-path">
          <g data-name="platform-path">
            <rect x="594.82" y="990.2" width="9" height="17" rx="4.5" transform="rotate(45 594.82 990.2)" fill="white" stroke="#424143"></rect>
          </g>

          <g data-name="station-path">
            <circle class="station-id-G1" cx="594.8" cy="996.4" r="2.5" fill="#D0AB4F" stroke-width="1.6"></circle>
          </g>
          <g data-name="station-path">
            <circle class="station-id-S7" cx="589.2" cy="1002.2" r="2.5" fill="#046461" stroke-width="1.6"></circle>
          </g>

        </g>
      </g>

      <g id="station_S12_BL34" data-name="transit" data-station-id="BL34">
        <g id="label-en-238" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(323.4 910.25)" font-size="6" fill="#424143">Bang Wa</text> </g>
        <g id="label-th-238" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(321.77 910.25)" font-size="6" fill="#424143">บางหว้า</text> </g>
        <g data-name="platform-transit-path">
          <g data-name="platform-path">
            <rect x="324" y="918.36" width="9" height="17" rx="4.5" transform="rotate(-45 324 918.36)" fill="white" stroke="#424143"></rect>
          </g>


          <g data-name="station-path">
            <circle class="station-id-BL34" cx="330.21" cy="918" r="2.5" fill="#0e6494" stroke-width="1.6"></circle>
          </g>

          <g data-name="station-path">
            <circle class="station-id-S12" cx="336" cy="924.28" r="2.5" fill="#046461" stroke-width="1.6"></circle>
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
          <g id="label-en-217" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(608.61 564.25)" font-size="6" fill="#424143">Chatuchak Park</text> </g>
          <g id="label-th-217" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(623.5 564.25)" font-size="6" fill="#424143">สวนจตุจักร</text> </g>
          <g id="station-path-217" data-name="station-path">


            <circle class="station-id-BL13" cx="661.1" cy="562.4" r="2.5" fill="#0E6494"></circle>


          </g>
        </g>

        <g id="station_N8" data-name="transit-station" data-station-id="N8">
          <g id="label-en-309" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(683.98 564.25)" font-size="6" fill="#424143">Mo Chit</text> </g>
          <g id="label-th-309" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(683.98 564.25)" font-size="6" fill="#424143">หมอชิต</text> </g>
          <g id="station-path-226" data-name="station-path">


            <circle class="station-id-N8" cx="675.1" cy="562.4" r="2.5" fill="#69a543"></circle>
          </g>
        </g>




      </g>

      <g id="station_BangSue_BL11_A9_RW01_RN01_RE01" data-name="bangsue" data-station-id="BL11">
        <g id="label-en-215" data-name="label-en">

          <text text-rendering="geometricPrecision" transform="translate(600.7 600)" font-size="6" fill="#424143">Bang Sue</text>
        </g>
        <g id="label-th-215" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(600.7 600)" font-size="6" fill="#424143">บางซื่อ</text> </g>
        <g data-name="platform-transit-path">
          <g data-name="platform-path">
            <rect x="571" y="604" width="40" height="15" rx="7.5" fill="white" stroke="#424143"></rect>
          </g>
          <g data-name="station-path">
            <circle class="station-id-RW01" cx="580.3" cy="611" r="3.5" fill="#F26163"></circle>
          </g>
          <g data-name="station-path">

            <circle class="station-id-RN01" cx="590.8" cy="611" r="3.5" fill="#C42329"></circle>

          </g>


          <g data-name="station-path">


            <circle class="station-id-BL11" cx="600.8" cy="611" r="3.5" fill="#0e6494"></circle>
          </g>
        </g>
      </g>

      <g id="station_BL15_YL01" data-name="transit" data-station-id="BL15">
        <g id="label-en-219" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(715.7 529.94)" font-size="6" fill="#424143">Lat Phrao</text> </g>
        <g id="label-th-219" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(715.7 529.94)" font-size="6" fill="#424143">ลาดพร้าว</text> </g>
        <g data-name="platform-transit-path">
          <g data-name="platform-path">
            <rect x="745.4" y="519.6" width="9" height="21" rx="4.5" fill="white" stroke="#424143"></rect>
          </g>
          <g data-name="station-path">
            <circle class="station-id-BL15" cx="749.87" cy="524.15" r="2.5" fill="#FCD110"></circle>
          </g>
          <g data-name="station-path">
            <circle class="station-id-YL01" cx="749.87" cy="536.18" r="2.5" fill="#0e6494"></circle>
          </g>
        </g>
      </g>

      <g id="station_A4_YL11" data-name="transit" data-station-id="YL11">
        <g id="label-en-314" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1108.17 719.98)" font-size="6" fill="#424143">Hua Mak</text> </g>
        <g id="label-th-314" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1110.17 721.98)" font-size="6" fill="#424143">หัวหมาก</text> </g>
        <g data-name="platform-transit-path">
          <g data-name="platform-path">
            <rect x="1136.92" y="716.8" width="9" height="17" rx="4.5" fill="white" stroke="#424143"></rect>
          </g>
          <g data-name="station-path">
            <circle class="station-id-YL11" cx="1141.44" cy="721.1" r="2.5" fill="#FCD110" stroke-width="1.6"></circle>
          </g>
          <g data-name="station-path">
            <circle class="station-id-A4" cx="1141.44" cy="728.9" r="2.5" fill="#B21617" stroke-width="1.6"></circle>
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
          <g id="label-en-217" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1005.64 1065.23)" font-size="6" fill="#424143">Samrong</text> </g>
          <g id="label-th-217" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1014.04 1065.26)" font-size="6" fill="#424143">สำโรง</text> </g>
          <g id="station-path-217" data-name="station-path">


            <circle class="station-id-E15" cx="1037" cy="1062.88" r="2.5" fill="#69a543"></circle>


          </g>
        </g>



        <g id="station_YL23" data-name="transit-station" data-station-id="YL23">
          <g id="label-en-309" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(1046.88 1074.28)" font-size="6" fill="#424143">Sam rong</text> </g>
          <g id="label-th-309" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(1047.08 1052.65)" font-size="6" fill="#424143">สำโรง</text> </g>
          <g id="station-path-226" data-name="station-path">


            <circle class="station-id-YL23" cx="1046.01" cy="1062.88" r="2.5" fill="#FCD110"></circle>
          </g>
        </g>
      </g>

      <g id="station_N17_PK16" data-name="transit" data-station-id="N17">
        <g id="label-en-300" data-name="label-en">
          <text transform="translate(684 284.5)" text-rendering="geometricPrecision" font-size="6" fill="#424143">Wat Phoa Si Maha That</text>
        </g>
        <g id="label-th-300" data-name="label-th">
          <text transform="translate(684 284.5)" text-rendering="geometricPrecision" font-size="6" fill="#424143">วัดพระศรีมหาธาตุ</text>
        </g>

        <g data-name="platform-transit-path">
          <g data-name="platform-path">
            <rect x="671" y="265.5" width="9" height="17" rx="4.5" fill="white" stroke="#424143"></rect>
          </g>

          <g data-name="station-path">
            <circle class="station-id-PK16" cx="675.5" cy="270.5" r="2.5" fill="#FFB2DD" stroke-width="1.6"></circle>
          </g>

          <g data-name="station-path">
            <circle class="station-id-N17" cx="675.5" cy="277.5" r="2.5" fill="#69a543" stroke-width="1.6"></circle>
          </g>
        </g>
      </g>

      <g id="station_RN06_PK14" data-name="transit" data-station-id="RN06">
        <g id="label-en-29" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(567.54 261.5)" font-size="6" fill="#424143">Lak Si</text> </g>
        <g id="label-th-29" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(568 261.5)" font-size="6" fill="#424143">หลักสี่</text></g>

        <g data-name="platform-transit-path">
          <g data-name="platform-path">
            <rect x="586.4" y="265.5" width="9" height="17" rx="4.5" fill="white" stroke="#424143"></rect>
          </g>

          <g data-name="station-path">
            <circle class="station-id-PK16" cx="590.9" cy="270.5" r="2.5" fill="#FFB2DD" stroke-width="1.6"></circle>
          </g>

          <g data-name="station-path">
            <circle class="station-id-N17" cx="590.9" cy="277.5" r="2.5" fill="#C42329" stroke-width="1.6"></circle>
          </g>
        </g>

        <g id="station_PP11_PK01" data-name="transit" data-station-id="PP11">
          <g id="label-en-178" data-name="label-en"> <text text-rendering="geometricPrecision" transform="translate(387 391)" font-size="6" fill="#424143">Nonthaburi Civic Center</text> </g>
          <g id="label-th-178" data-name="label-th"> <text text-rendering="geometricPrecision" transform="translate(389 391)" font-size="6" fill="#424143">ศูนย์ราชการนนทบุรี</text> </g>



          <g data-name="platform-transit-path">
            <g data-name="platform-path">
              <rect x="376.4" y="381.5" width="9" height="17" rx="4.5" fill="white" stroke="#424143"></rect>
            </g>

            <g data-name="station-path">
              <circle class="station-id-PK16" cx="380.9" cy="386.5" r="2.5" fill="#FFB2DD" stroke-width="1.6"></circle>
            </g>

            <g data-name="station-path">
              <circle class="station-id-N17" cx="380.9" cy="393.5" r="2.5" fill="#9B54A2" stroke-width="1.6"></circle>
            </g>
          </g>

        </g>
      </g></g></svg></g></svg>
);
