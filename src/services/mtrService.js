// services/mtrService.js

import AsyncStorage from '@react-native-async-storage/async-storage';

// Static data moved inline since JSON import is failing
const MTR_STATIONS_DATA = {
    "fares": [
        {
            "Line Code": "AEL",
            "Direction": "DT",
            "Station Code": "AWE",
            "Station ID": 56,
            "Chinese Name": "博覽館",
            "English Name": "AsiaWorld-Expo",
            "Sequence": 1
          },
          {
            "Line Code": "AEL",
            "Direction": "DT",
            "Station Code": "AIR",
            "Station ID": 47,
            "Chinese Name": "機場",
            "English Name": "Airport",
            "Sequence": 2
          },
          {
            "Line Code": "AEL",
            "Direction": "DT",
            "Station Code": "TSY",
            "Station ID": 46,
            "Chinese Name": "青衣",
            "English Name": "Tsing Yi",
            "Sequence": 3
          },
          {
            "Line Code": "AEL",
            "Direction": "DT",
            "Station Code": "KOW",
            "Station ID": 45,
            "Chinese Name": "九龍",
            "English Name": "Kowloon",
            "Sequence": 4
          },
          {
            "Line Code": "AEL",
            "Direction": "DT",
            "Station Code": "HOK",
            "Station ID": 44,
            "Chinese Name": "香港",
            "English Name": "Hong Kong",
            "Sequence": 5
          },
          {
            "Line Code": "AEL",
            "Direction": "UT",
            "Station Code": "HOK",
            "Station ID": 44,
            "Chinese Name": "香港",
            "English Name": "Hong Kong",
            "Sequence": 1
          },
          {
            "Line Code": "AEL",
            "Direction": "UT",
            "Station Code": "KOW",
            "Station ID": 45,
            "Chinese Name": "九龍",
            "English Name": "Kowloon",
            "Sequence": 2
          },
          {
            "Line Code": "AEL",
            "Direction": "UT",
            "Station Code": "TSY",
            "Station ID": 46,
            "Chinese Name": "青衣",
            "English Name": "Tsing Yi",
            "Sequence": 3
          },
          {
            "Line Code": "AEL",
            "Direction": "UT",
            "Station Code": "AIR",
            "Station ID": 47,
            "Chinese Name": "機場",
            "English Name": "Airport",
            "Sequence": 4
          },
          {
            "Line Code": "AEL",
            "Direction": "UT",
            "Station Code": "AWE",
            "Station ID": 56,
            "Chinese Name": "博覽館",
            "English Name": "AsiaWorld-Expo",
            "Sequence": 5
          },
          {
            "Line Code": "DRL",
            "Direction": "DT",
            "Station Code": "SUN",
            "Station ID": 54,
            "Chinese Name": "欣澳",
            "English Name": "Sunny Bay",
            "Sequence": 1
          },
          {
            "Line Code": "DRL",
            "Direction": "DT",
            "Station Code": "DIS",
            "Station ID": 55,
            "Chinese Name": "迪士尼",
            "English Name": "Disneyland Resort",
            "Sequence": 2
          },
          {
            "Line Code": "DRL",
            "Direction": "UT",
            "Station Code": "DIS",
            "Station ID": 55,
            "Chinese Name": "迪士尼",
            "English Name": "Disneyland Resort",
            "Sequence": 1
          },
          {
            "Line Code": "DRL",
            "Direction": "UT",
            "Station Code": "SUN",
            "Station ID": 54,
            "Chinese Name": "欣澳",
            "English Name": "Sunny Bay",
            "Sequence": 2
          },
          {
            "Line Code": "EAL",
            "Direction": "DT",
            "Station Code": "LOW",
            "Station ID": 76,
            "Chinese Name": "羅湖",
            "English Name": "Lo Wu",
            "Sequence": 1
          },
          {
            "Line Code": "EAL",
            "Direction": "DT",
            "Station Code": "SHS",
            "Station ID": 75,
            "Chinese Name": "上水",
            "English Name": "Sheung Shui",
            "Sequence": 2
          },
          {
            "Line Code": "EAL",
            "Direction": "DT",
            "Station Code": "FAN",
            "Station ID": 74,
            "Chinese Name": "粉嶺",
            "English Name": "Fanling",
            "Sequence": 3
          },
          {
            "Line Code": "EAL",
            "Direction": "DT",
            "Station Code": "TWO",
            "Station ID": 73,
            "Chinese Name": "太和",
            "English Name": "Tai Wo",
            "Sequence": 4
          },
          {
            "Line Code": "EAL",
            "Direction": "DT",
            "Station Code": "TAP",
            "Station ID": 72,
            "Chinese Name": "大埔墟",
            "English Name": "Tai Po Market",
            "Sequence": 5
          },
          {
            "Line Code": "EAL",
            "Direction": "DT",
            "Station Code": "UNI",
            "Station ID": 71,
            "Chinese Name": "大學",
            "English Name": "University",
            "Sequence": 6
          },
          {
            "Line Code": "EAL",
            "Direction": "DT",
            "Station Code": "FOT",
            "Station ID": 69,
            "Chinese Name": "火炭",
            "English Name": "Fo Tan",
            "Sequence": 7
          },
          {
            "Line Code": "EAL",
            "Direction": "DT",
            "Station Code": "SHT",
            "Station ID": 68,
            "Chinese Name": "沙田",
            "English Name": "Sha Tin",
            "Sequence": 8
          },
          {
            "Line Code": "EAL",
            "Direction": "DT",
            "Station Code": "TAW",
            "Station ID": 67,
            "Chinese Name": "大圍",
            "English Name": "Tai Wai",
            "Sequence": 9
          },
          {
            "Line Code": "EAL",
            "Direction": "DT",
            "Station Code": "KOT",
            "Station ID": 8,
            "Chinese Name": "九龍塘",
            "English Name": "Kowloon Tong",
            "Sequence": 10
          },
          {
            "Line Code": "EAL",
            "Direction": "DT",
            "Station Code": "MKK",
            "Station ID": 65,
            "Chinese Name": "旺角東",
            "English Name": "Mong Kok East",
            "Sequence": 11
          },
          {
            "Line Code": "EAL",
            "Direction": "DT",
            "Station Code": "HUH",
            "Station ID": 64,
            "Chinese Name": "紅磡",
            "English Name": "Hung Hom",
            "Sequence": 12
          },
          {
            "Line Code": "EAL",
            "Direction": "DT",
            "Station Code": "EXC",
            "Station ID": 94,
            "Chinese Name": "會展",
            "English Name": "Exhibition Centre",
            "Sequence": 13
          },
          {
            "Line Code": "EAL",
            "Direction": "DT",
            "Station Code": "ADM",
            "Station ID": 2,
            "Chinese Name": "金鐘",
            "English Name": "Admiralty",
            "Sequence": 14
          },
          {
            "Line Code": "EAL",
            "Direction": "LMC-DT",
            "Station Code": "LMC",
            "Station ID": 78,
            "Chinese Name": "落馬洲",
            "English Name": "Lok Ma Chau",
            "Sequence": 1
          },
          {
            "Line Code": "EAL",
            "Direction": "LMC-DT",
            "Station Code": "SHS",
            "Station ID": 75,
            "Chinese Name": "上水",
            "English Name": "Sheung Shui",
            "Sequence": 2
          },
          {
            "Line Code": "EAL",
            "Direction": "LMC-DT",
            "Station Code": "FAN",
            "Station ID": 74,
            "Chinese Name": "粉嶺",
            "English Name": "Fanling",
            "Sequence": 3
          },
          {
            "Line Code": "EAL",
            "Direction": "LMC-DT",
            "Station Code": "TWO",
            "Station ID": 73,
            "Chinese Name": "太和",
            "English Name": "Tai Wo",
            "Sequence": 4
          },
          {
            "Line Code": "EAL",
            "Direction": "LMC-DT",
            "Station Code": "TAP",
            "Station ID": 72,
            "Chinese Name": "大埔墟",
            "English Name": "Tai Po Market",
            "Sequence": 5
          },
          {
            "Line Code": "EAL",
            "Direction": "LMC-DT",
            "Station Code": "UNI",
            "Station ID": 71,
            "Chinese Name": "大學",
            "English Name": "University",
            "Sequence": 6
          },
          {
            "Line Code": "EAL",
            "Direction": "LMC-DT",
            "Station Code": "FOT",
            "Station ID": 69,
            "Chinese Name": "火炭",
            "English Name": "Fo Tan",
            "Sequence": 7
          },
          {
            "Line Code": "EAL",
            "Direction": "LMC-DT",
            "Station Code": "SHT",
            "Station ID": 68,
            "Chinese Name": "沙田",
            "English Name": "Sha Tin",
            "Sequence": 8
          },
          {
            "Line Code": "EAL",
            "Direction": "LMC-DT",
            "Station Code": "TAW",
            "Station ID": 67,
            "Chinese Name": "大圍",
            "English Name": "Tai Wai",
            "Sequence": 9
          },
          {
            "Line Code": "EAL",
            "Direction": "LMC-DT",
            "Station Code": "KOT",
            "Station ID": 8,
            "Chinese Name": "九龍塘",
            "English Name": "Kowloon Tong",
            "Sequence": 10
          },
          {
            "Line Code": "EAL",
            "Direction": "LMC-DT",
            "Station Code": "MKK",
            "Station ID": 65,
            "Chinese Name": "旺角東",
            "English Name": "Mong Kok East",
            "Sequence": 11
          },
          {
            "Line Code": "EAL",
            "Direction": "LMC-DT",
            "Station Code": "HUH",
            "Station ID": 64,
            "Chinese Name": "紅磡",
            "English Name": "Hung Hom",
            "Sequence": 12
          },
          {
            "Line Code": "EAL",
            "Direction": "LMC-DT",
            "Station Code": "EXC",
            "Station ID": 94,
            "Chinese Name": "會展",
            "English Name": "Exhibition Centre",
            "Sequence": 13
          },
          {
            "Line Code": "EAL",
            "Direction": "LMC-DT",
            "Station Code": "ADM",
            "Station ID": 2,
            "Chinese Name": "金鐘",
            "English Name": "Admiralty",
            "Sequence": 14
          },
          {
            "Line Code": "EAL",
            "Direction": "LMC-UT",
            "Station Code": "ADM",
            "Station ID": 2,
            "Chinese Name": "金鐘",
            "English Name": "Admiralty",
            "Sequence": 1
          },
          {
            "Line Code": "EAL",
            "Direction": "LMC-UT",
            "Station Code": "EXC",
            "Station ID": 94,
            "Chinese Name": "會展",
            "English Name": "Exhibition Centre",
            "Sequence": 2
          },
          {
            "Line Code": "EAL",
            "Direction": "LMC-UT",
            "Station Code": "HUH",
            "Station ID": 64,
            "Chinese Name": "紅磡",
            "English Name": "Hung Hom",
            "Sequence": 3
          },
          {
            "Line Code": "EAL",
            "Direction": "LMC-UT",
            "Station Code": "MKK",
            "Station ID": 65,
            "Chinese Name": "旺角東",
            "English Name": "Mong Kok East",
            "Sequence": 4
          },
          {
            "Line Code": "EAL",
            "Direction": "LMC-UT",
            "Station Code": "KOT",
            "Station ID": 8,
            "Chinese Name": "九龍塘",
            "English Name": "Kowloon Tong",
            "Sequence": 5
          },
          {
            "Line Code": "EAL",
            "Direction": "LMC-UT",
            "Station Code": "TAW",
            "Station ID": 67,
            "Chinese Name": "大圍",
            "English Name": "Tai Wai",
            "Sequence": 6
          },
          {
            "Line Code": "EAL",
            "Direction": "LMC-UT",
            "Station Code": "SHT",
            "Station ID": 68,
            "Chinese Name": "沙田",
            "English Name": "Sha Tin",
            "Sequence": 7
          },
          {
            "Line Code": "EAL",
            "Direction": "LMC-UT",
            "Station Code": "FOT",
            "Station ID": 69,
            "Chinese Name": "火炭",
            "English Name": "Fo Tan",
            "Sequence": 8
          },
          {
            "Line Code": "EAL",
            "Direction": "LMC-UT",
            "Station Code": "UNI",
            "Station ID": 71,
            "Chinese Name": "大學",
            "English Name": "University",
            "Sequence": 9
          },
          {
            "Line Code": "EAL",
            "Direction": "LMC-UT",
            "Station Code": "TAP",
            "Station ID": 72,
            "Chinese Name": "大埔墟",
            "English Name": "Tai Po Market",
            "Sequence": 10
          },
          {
            "Line Code": "EAL",
            "Direction": "LMC-UT",
            "Station Code": "TWO",
            "Station ID": 73,
            "Chinese Name": "太和",
            "English Name": "Tai Wo",
            "Sequence": 11
          },
          {
            "Line Code": "EAL",
            "Direction": "LMC-UT",
            "Station Code": "FAN",
            "Station ID": 74,
            "Chinese Name": "粉嶺",
            "English Name": "Fanling",
            "Sequence": 12
          },
          {
            "Line Code": "EAL",
            "Direction": "LMC-UT",
            "Station Code": "SHS",
            "Station ID": 75,
            "Chinese Name": "上水",
            "English Name": "Sheung Shui",
            "Sequence": 13
          },
          {
            "Line Code": "EAL",
            "Direction": "LMC-UT",
            "Station Code": "LMC",
            "Station ID": 78,
            "Chinese Name": "落馬洲",
            "English Name": "Lok Ma Chau",
            "Sequence": 14
          },
          {
            "Line Code": "EAL",
            "Direction": "UT",
            "Station Code": "ADM",
            "Station ID": 2,
            "Chinese Name": "金鐘",
            "English Name": "Admiralty",
            "Sequence": 1
          },
          {
            "Line Code": "EAL",
            "Direction": "UT",
            "Station Code": "EXC",
            "Station ID": 94,
            "Chinese Name": "會展",
            "English Name": "Exhibition Centre",
            "Sequence": 2
          },
          {
            "Line Code": "EAL",
            "Direction": "UT",
            "Station Code": "HUH",
            "Station ID": 64,
            "Chinese Name": "紅磡",
            "English Name": "Hung Hom",
            "Sequence": 3
          },
          {
            "Line Code": "EAL",
            "Direction": "UT",
            "Station Code": "MKK",
            "Station ID": 65,
            "Chinese Name": "旺角東",
            "English Name": "Mong Kok East",
            "Sequence": 4
          },
          {
            "Line Code": "EAL",
            "Direction": "UT",
            "Station Code": "KOT",
            "Station ID": 8,
            "Chinese Name": "九龍塘",
            "English Name": "Kowloon Tong",
            "Sequence": 5
          },
          {
            "Line Code": "EAL",
            "Direction": "UT",
            "Station Code": "TAW",
            "Station ID": 67,
            "Chinese Name": "大圍",
            "English Name": "Tai Wai",
            "Sequence": 6
          },
          {
            "Line Code": "EAL",
            "Direction": "UT",
            "Station Code": "SHT",
            "Station ID": 68,
            "Chinese Name": "沙田",
            "English Name": "Sha Tin",
            "Sequence": 7
          },
          {
            "Line Code": "EAL",
            "Direction": "UT",
            "Station Code": "FOT",
            "Station ID": 69,
            "Chinese Name": "火炭",
            "English Name": "Fo Tan",
            "Sequence": 8
          },
          {
            "Line Code": "EAL",
            "Direction": "UT",
            "Station Code": "UNI",
            "Station ID": 71,
            "Chinese Name": "大學",
            "English Name": "University",
            "Sequence": 9
          },
          {
            "Line Code": "EAL",
            "Direction": "UT",
            "Station Code": "TAP",
            "Station ID": 72,
            "Chinese Name": "大埔墟",
            "English Name": "Tai Po Market",
            "Sequence": 10
          },
          {
            "Line Code": "EAL",
            "Direction": "UT",
            "Station Code": "TWO",
            "Station ID": 73,
            "Chinese Name": "太和",
            "English Name": "Tai Wo",
            "Sequence": 11
          },
          {
            "Line Code": "EAL",
            "Direction": "UT",
            "Station Code": "FAN",
            "Station ID": 74,
            "Chinese Name": "粉嶺",
            "English Name": "Fanling",
            "Sequence": 12
          },
          {
            "Line Code": "EAL",
            "Direction": "UT",
            "Station Code": "SHS",
            "Station ID": 75,
            "Chinese Name": "上水",
            "English Name": "Sheung Shui",
            "Sequence": 13
          },
          {
            "Line Code": "EAL",
            "Direction": "UT",
            "Station Code": "LOW",
            "Station ID": 76,
            "Chinese Name": "羅湖",
            "English Name": "Lo Wu",
            "Sequence": 14
          },
          {
            "Line Code": "ISL",
            "Direction": "DT",
            "Station Code": "CHW",
            "Station ID": 37,
            "Chinese Name": "柴灣",
            "English Name": "Chai Wan",
            "Sequence": 1
          },
          {
            "Line Code": "ISL",
            "Direction": "DT",
            "Station Code": "HFC",
            "Station ID": 36,
            "Chinese Name": "杏花邨",
            "English Name": "Heng Fa Chuen",
            "Sequence": 2
          },
          {
            "Line Code": "ISL",
            "Direction": "DT",
            "Station Code": "SKW",
            "Station ID": 35,
            "Chinese Name": "筲箕灣",
            "English Name": "Shau Kei Wan",
            "Sequence": 3
          },
          {
            "Line Code": "ISL",
            "Direction": "DT",
            "Station Code": "SWH",
            "Station ID": 34,
            "Chinese Name": "西灣河",
            "English Name": "Sai Wan Ho",
            "Sequence": 4
          },
          {
            "Line Code": "ISL",
            "Direction": "DT",
            "Station Code": "TAK",
            "Station ID": 33,
            "Chinese Name": "太古",
            "English Name": "Tai Koo",
            "Sequence": 5
          },
          {
            "Line Code": "ISL",
            "Direction": "DT",
            "Station Code": "QUB",
            "Station ID": 32,
            "Chinese Name": "鰂魚涌",
            "English Name": "Quarry Bay",
            "Sequence": 6
          },
          {
            "Line Code": "ISL",
            "Direction": "DT",
            "Station Code": "NOP",
            "Station ID": 31,
            "Chinese Name": "北角",
            "English Name": "North Point",
            "Sequence": 7
          },
          {
            "Line Code": "ISL",
            "Direction": "DT",
            "Station Code": "FOH",
            "Station ID": 30,
            "Chinese Name": "炮台山",
            "English Name": "Fortress Hill",
            "Sequence": 8
          },
          {
            "Line Code": "ISL",
            "Direction": "DT",
            "Station Code": "TIH",
            "Station ID": 29,
            "Chinese Name": "天后",
            "English Name": "Tin Hau",
            "Sequence": 9
          },
          {
            "Line Code": "ISL",
            "Direction": "DT",
            "Station Code": "CAB",
            "Station ID": 28,
            "Chinese Name": "銅鑼灣",
            "English Name": "Causeway Bay",
            "Sequence": 10
          },
          {
            "Line Code": "ISL",
            "Direction": "DT",
            "Station Code": "WAC",
            "Station ID": 27,
            "Chinese Name": "灣仔",
            "English Name": "Wan Chai",
            "Sequence": 11
          },
          {
            "Line Code": "ISL",
            "Direction": "DT",
            "Station Code": "ADM",
            "Station ID": 2,
            "Chinese Name": "金鐘",
            "English Name": "Admiralty",
            "Sequence": 12
          },
          {
            "Line Code": "ISL",
            "Direction": "DT",
            "Station Code": "CEN",
            "Station ID": 1,
            "Chinese Name": "中環",
            "English Name": "Central",
            "Sequence": 13
          },
          {
            "Line Code": "ISL",
            "Direction": "DT",
            "Station Code": "SHW",
            "Station ID": 26,
            "Chinese Name": "上環",
            "English Name": "Sheung Wan",
            "Sequence": 14
          },
          {
            "Line Code": "ISL",
            "Direction": "DT",
            "Station Code": "SYP",
            "Station ID": 81,
            "Chinese Name": "西營盤",
            "English Name": "Sai Ying Pun",
            "Sequence": 15
          },
          {
            "Line Code": "ISL",
            "Direction": "DT",
            "Station Code": "HKU",
            "Station ID": 82,
            "Chinese Name": "香港大學",
            "English Name": "HKU",
            "Sequence": 16
          },
          {
            "Line Code": "ISL",
            "Direction": "DT",
            "Station Code": "KET",
            "Station ID": 83,
            "Chinese Name": "堅尼地城",
            "English Name": "Kennedy Town",
            "Sequence": 17
          },
          {
            "Line Code": "ISL",
            "Direction": "UT",
            "Station Code": "KET",
            "Station ID": 83,
            "Chinese Name": "堅尼地城",
            "English Name": "Kennedy Town",
            "Sequence": 1
          },
          {
            "Line Code": "ISL",
            "Direction": "UT",
            "Station Code": "HKU",
            "Station ID": 82,
            "Chinese Name": "香港大學",
            "English Name": "HKU",
            "Sequence": 2
          },
          {
            "Line Code": "ISL",
            "Direction": "UT",
            "Station Code": "SYP",
            "Station ID": 81,
            "Chinese Name": "西營盤",
            "English Name": "Sai Ying Pun",
            "Sequence": 3
          },
          {
            "Line Code": "ISL",
            "Direction": "UT",
            "Station Code": "SHW",
            "Station ID": 26,
            "Chinese Name": "上環",
            "English Name": "Sheung Wan",
            "Sequence": 4
          },
          {
            "Line Code": "ISL",
            "Direction": "UT",
            "Station Code": "CEN",
            "Station ID": 1,
            "Chinese Name": "中環",
            "English Name": "Central",
            "Sequence": 5
          },
          {
            "Line Code": "ISL",
            "Direction": "UT",
            "Station Code": "ADM",
            "Station ID": 2,
            "Chinese Name": "金鐘",
            "English Name": "Admiralty",
            "Sequence": 6
          },
          {
            "Line Code": "ISL",
            "Direction": "UT",
            "Station Code": "WAC",
            "Station ID": 27,
            "Chinese Name": "灣仔",
            "English Name": "Wan Chai",
            "Sequence": 7
          },
          {
            "Line Code": "ISL",
            "Direction": "UT",
            "Station Code": "CAB",
            "Station ID": 28,
            "Chinese Name": "銅鑼灣",
            "English Name": "Causeway Bay",
            "Sequence": 8
          },
          {
            "Line Code": "ISL",
            "Direction": "UT",
            "Station Code": "TIH",
            "Station ID": 29,
            "Chinese Name": "天后",
            "English Name": "Tin Hau",
            "Sequence": 9
          },
          {
            "Line Code": "ISL",
            "Direction": "UT",
            "Station Code": "FOH",
            "Station ID": 30,
            "Chinese Name": "炮台山",
            "English Name": "Fortress Hill",
            "Sequence": 10
          },
          {
            "Line Code": "ISL",
            "Direction": "UT",
            "Station Code": "NOP",
            "Station ID": 31,
            "Chinese Name": "北角",
            "English Name": "North Point",
            "Sequence": 11
          },
          {
            "Line Code": "ISL",
            "Direction": "UT",
            "Station Code": "QUB",
            "Station ID": 32,
            "Chinese Name": "鰂魚涌",
            "English Name": "Quarry Bay",
            "Sequence": 12
          },
          {
            "Line Code": "ISL",
            "Direction": "UT",
            "Station Code": "TAK",
            "Station ID": 33,
            "Chinese Name": "太古",
            "English Name": "Tai Koo",
            "Sequence": 13
          },
          {
            "Line Code": "ISL",
            "Direction": "UT",
            "Station Code": "SWH",
            "Station ID": 34,
            "Chinese Name": "西灣河",
            "English Name": "Sai Wan Ho",
            "Sequence": 14
          },
          {
            "Line Code": "ISL",
            "Direction": "UT",
            "Station Code": "SKW",
            "Station ID": 35,
            "Chinese Name": "筲箕灣",
            "English Name": "Shau Kei Wan",
            "Sequence": 15
          },
          {
            "Line Code": "ISL",
            "Direction": "UT",
            "Station Code": "HFC",
            "Station ID": 36,
            "Chinese Name": "杏花邨",
            "English Name": "Heng Fa Chuen",
            "Sequence": 16
          },
          {
            "Line Code": "ISL",
            "Direction": "UT",
            "Station Code": "CHW",
            "Station ID": 37,
            "Chinese Name": "柴灣",
            "English Name": "Chai Wan",
            "Sequence": 17
          },
          {
            "Line Code": "KTL",
            "Direction": "DT",
            "Station Code": "TIK",
            "Station ID": 49,
            "Chinese Name": "調景嶺",
            "English Name": "Tiu Keng Leng",
            "Sequence": 1
          },
          {
            "Line Code": "KTL",
            "Direction": "DT",
            "Station Code": "YAT",
            "Station ID": 48,
            "Chinese Name": "油塘",
            "English Name": "Yau Tong",
            "Sequence": 2
          },
          {
            "Line Code": "KTL",
            "Direction": "DT",
            "Station Code": "LAT",
            "Station ID": 38,
            "Chinese Name": "藍田",
            "English Name": "Lam Tin",
            "Sequence": 3
          },
          {
            "Line Code": "KTL",
            "Direction": "DT",
            "Station Code": "KWT",
            "Station ID": 15,
            "Chinese Name": "觀塘",
            "English Name": "Kwun Tong",
            "Sequence": 4
          },
          {
            "Line Code": "KTL",
            "Direction": "DT",
            "Station Code": "NTK",
            "Station ID": 14,
            "Chinese Name": "牛頭角",
            "English Name": "Ngau Tau Kok",
            "Sequence": 5
          },
          {
            "Line Code": "KTL",
            "Direction": "DT",
            "Station Code": "KOB",
            "Station ID": 13,
            "Chinese Name": "九龍灣",
            "English Name": "Kowloon Bay",
            "Sequence": 6
          },
          {
            "Line Code": "KTL",
            "Direction": "DT",
            "Station Code": "CHH",
            "Station ID": 12,
            "Chinese Name": "彩虹",
            "English Name": "Choi Hung",
            "Sequence": 7
          },
          {
            "Line Code": "KTL",
            "Direction": "DT",
            "Station Code": "DIH",
            "Station ID": 11,
            "Chinese Name": "鑽石山",
            "English Name": "Diamond Hill",
            "Sequence": 8
          },
          {
            "Line Code": "KTL",
            "Direction": "DT",
            "Station Code": "WTS",
            "Station ID": 10,
            "Chinese Name": "黃大仙",
            "English Name": "Wong Tai Sin",
            "Sequence": 9
          },
          {
            "Line Code": "KTL",
            "Direction": "DT",
            "Station Code": "LOF",
            "Station ID": 9,
            "Chinese Name": "樂富",
            "English Name": "Lok Fu",
            "Sequence": 10
          },
          {
            "Line Code": "KTL",
            "Direction": "DT",
            "Station Code": "KOT",
            "Station ID": 8,
            "Chinese Name": "九龍塘",
            "English Name": "Kowloon Tong",
            "Sequence": 11
          },
          {
            "Line Code": "KTL",
            "Direction": "DT",
            "Station Code": "SKM",
            "Station ID": 7,
            "Chinese Name": "石硤尾",
            "English Name": "Shek Kip Mei",
            "Sequence": 12
          },
          {
            "Line Code": "KTL",
            "Direction": "DT",
            "Station Code": "PRE",
            "Station ID": 16,
            "Chinese Name": "太子",
            "English Name": "Prince Edward",
            "Sequence": 13
          },
          {
            "Line Code": "KTL",
            "Direction": "DT",
            "Station Code": "MOK",
            "Station ID": 6,
            "Chinese Name": "旺角",
            "English Name": "Mong Kok",
            "Sequence": 14
          },
          {
            "Line Code": "KTL",
            "Direction": "DT",
            "Station Code": "YMT",
            "Station ID": 5,
            "Chinese Name": "油麻地",
            "English Name": "Yau Ma Tei",
            "Sequence": 15
          },
          {
            "Line Code": "KTL",
            "Direction": "DT",
            "Station Code": "HOM",
            "Station ID": 84,
            "Chinese Name": "何文田",
            "English Name": "Ho Man Tin",
            "Sequence": 16
          },
          {
            "Line Code": "KTL",
            "Direction": "DT",
            "Station Code": "WHA",
            "Station ID": 85,
            "Chinese Name": "黃埔",
            "English Name": "Whampoa",
            "Sequence": 17
          },
          {
            "Line Code": "KTL",
            "Direction": "UT",
            "Station Code": "WHA",
            "Station ID": 85,
            "Chinese Name": "黃埔",
            "English Name": "Whampoa",
            "Sequence": 1
          },
          {
            "Line Code": "KTL",
            "Direction": "UT",
            "Station Code": "HOM",
            "Station ID": 84,
            "Chinese Name": "何文田",
            "English Name": "Ho Man Tin",
            "Sequence": 2
          },
          {
            "Line Code": "KTL",
            "Direction": "UT",
            "Station Code": "YMT",
            "Station ID": 5,
            "Chinese Name": "油麻地",
            "English Name": "Yau Ma Tei",
            "Sequence": 3
          },
          {
            "Line Code": "KTL",
            "Direction": "UT",
            "Station Code": "MOK",
            "Station ID": 6,
            "Chinese Name": "旺角",
            "English Name": "Mong Kok",
            "Sequence": 4
          },
          {
            "Line Code": "KTL",
            "Direction": "UT",
            "Station Code": "PRE",
            "Station ID": 16,
            "Chinese Name": "太子",
            "English Name": "Prince Edward",
            "Sequence": 5
          },
          {
            "Line Code": "KTL",
            "Direction": "UT",
            "Station Code": "SKM",
            "Station ID": 7,
            "Chinese Name": "石硤尾",
            "English Name": "Shek Kip Mei",
            "Sequence": 6
          },
          {
            "Line Code": "KTL",
            "Direction": "UT",
            "Station Code": "KOT",
            "Station ID": 8,
            "Chinese Name": "九龍塘",
            "English Name": "Kowloon Tong",
            "Sequence": 7
          },
          {
            "Line Code": "KTL",
            "Direction": "UT",
            "Station Code": "LOF",
            "Station ID": 9,
            "Chinese Name": "樂富",
            "English Name": "Lok Fu",
            "Sequence": 8
          },
          {
            "Line Code": "KTL",
            "Direction": "UT",
            "Station Code": "WTS",
            "Station ID": 10,
            "Chinese Name": "黃大仙",
            "English Name": "Wong Tai Sin",
            "Sequence": 9
          },
          {
            "Line Code": "KTL",
            "Direction": "UT",
            "Station Code": "DIH",
            "Station ID": 11,
            "Chinese Name": "鑽石山",
            "English Name": "Diamond Hill",
            "Sequence": 10
          },
          {
            "Line Code": "KTL",
            "Direction": "UT",
            "Station Code": "CHH",
            "Station ID": 12,
            "Chinese Name": "彩虹",
            "English Name": "Choi Hung",
            "Sequence": 11
          },
          {
            "Line Code": "KTL",
            "Direction": "UT",
            "Station Code": "KOB",
            "Station ID": 13,
            "Chinese Name": "九龍灣",
            "English Name": "Kowloon Bay",
            "Sequence": 12
          },
          {
            "Line Code": "KTL",
            "Direction": "UT",
            "Station Code": "NTK",
            "Station ID": 14,
            "Chinese Name": "牛頭角",
            "English Name": "Ngau Tau Kok",
            "Sequence": 13
          },
          {
            "Line Code": "KTL",
            "Direction": "UT",
            "Station Code": "KWT",
            "Station ID": 15,
            "Chinese Name": "觀塘",
            "English Name": "Kwun Tong",
            "Sequence": 14
          },
          {
            "Line Code": "KTL",
            "Direction": "UT",
            "Station Code": "LAT",
            "Station ID": 38,
            "Chinese Name": "藍田",
            "English Name": "Lam Tin",
            "Sequence": 15
          },
          {
            "Line Code": "KTL",
            "Direction": "UT",
            "Station Code": "YAT",
            "Station ID": 48,
            "Chinese Name": "油塘",
            "English Name": "Yau Tong",
            "Sequence": 16
          },
          {
            "Line Code": "KTL",
            "Direction": "UT",
            "Station Code": "TIK",
            "Station ID": 49,
            "Chinese Name": "調景嶺",
            "English Name": "Tiu Keng Leng",
            "Sequence": 17
          },
          {
            "Line Code": "TML",
            "Direction": "UT",
            "Station Code": "WKS",
            "Station ID": 103,
            "Chinese Name": "烏溪沙",
            "English Name": "Wu Kai Sha",
            "Sequence": 1
          },
          {
            "Line Code": "TML",
            "Direction": "UT",
            "Station Code": "MOS",
            "Station ID": 102,
            "Chinese Name": "馬鞍山",
            "English Name": "Ma On Shan",
            "Sequence": 2
          },
          {
            "Line Code": "TML",
            "Direction": "UT",
            "Station Code": "HEO",
            "Station ID": 101,
            "Chinese Name": "恆安",
            "English Name": "Heng On",
            "Sequence": 3
          },
          {
            "Line Code": "TML",
            "Direction": "UT",
            "Station Code": "TSH",
            "Station ID": 100,
            "Chinese Name": "大水坑",
            "English Name": "Tai Shui Hang",
            "Sequence": 4
          },
          {
            "Line Code": "TML",
            "Direction": "UT",
            "Station Code": "SHM",
            "Station ID": 99,
            "Chinese Name": "石門",
            "English Name": "Shek Mun",
            "Sequence": 5
          },
          {
            "Line Code": "TML",
            "Direction": "UT",
            "Station Code": "CIO",
            "Station ID": 98,
            "Chinese Name": "第一城",
            "English Name": "City One",
            "Sequence": 6
          },
          {
            "Line Code": "TML",
            "Direction": "UT",
            "Station Code": "STW",
            "Station ID": 97,
            "Chinese Name": "沙田圍",
            "English Name": "Sha Tin Wai",
            "Sequence": 7
          },
          {
            "Line Code": "TML",
            "Direction": "UT",
            "Station Code": "CKT",
            "Station ID": 96,
            "Chinese Name": "車公廟",
            "English Name": "Che Kung Temple",
            "Sequence": 8
          },
          {
            "Line Code": "TML",
            "Direction": "UT",
            "Station Code": "TAW",
            "Station ID": 67,
            "Chinese Name": "大圍",
            "English Name": "Tai Wai",
            "Sequence": 9
          },
          {
            "Line Code": "TML",
            "Direction": "UT",
            "Station Code": "HIK",
            "Station ID": 90,
            "Chinese Name": "顯徑",
            "English Name": "Hin Keng",
            "Sequence": 10
          },
          {
            "Line Code": "TML",
            "Direction": "UT",
            "Station Code": "DIH",
            "Station ID": 11,
            "Chinese Name": "鑽石山",
            "English Name": "Diamond Hill",
            "Sequence": 11
          },
          {
            "Line Code": "TML",
            "Direction": "UT",
            "Station Code": "KAT",
            "Station ID": 91,
            "Chinese Name": "啟德",
            "English Name": "Kai Tak",
            "Sequence": 12
          },
          {
            "Line Code": "TML",
            "Direction": "UT",
            "Station Code": "SUW",
            "Station ID": 92,
            "Chinese Name": "宋皇臺",
            "English Name": "Sung Wong Toi",
            "Sequence": 13
          },
          {
            "Line Code": "TML",
            "Direction": "UT",
            "Station Code": "TKW",
            "Station ID": 93,
            "Chinese Name": "土瓜灣",
            "English Name": "To Kwa Wan",
            "Sequence": 14
          },
          {
            "Line Code": "TML",
            "Direction": "UT",
            "Station Code": "HOM",
            "Station ID": 84,
            "Chinese Name": "何文田",
            "English Name": "Ho Man Tin",
            "Sequence": 15
          },
          {
            "Line Code": "TML",
            "Direction": "UT",
            "Station Code": "HUH",
            "Station ID": 64,
            "Chinese Name": "紅磡",
            "English Name": "Hung Hom",
            "Sequence": 16
          },
          {
            "Line Code": "TML",
            "Direction": "UT",
            "Station Code": "ETS",
            "Station ID": 80,
            "Chinese Name": "尖東",
            "English Name": "East Tsim Sha Tsui",
            "Sequence": 17
          },
          {
            "Line Code": "TML",
            "Direction": "UT",
            "Station Code": "AUS",
            "Station ID": 111,
            "Chinese Name": "柯士甸",
            "English Name": "Austin",
            "Sequence": 18
          },
          {
            "Line Code": "TML",
            "Direction": "UT",
            "Station Code": "NAC",
            "Station ID": 53,
            "Chinese Name": "南昌",
            "English Name": "Nam Cheong",
            "Sequence": 19
          },
          {
            "Line Code": "TML",
            "Direction": "UT",
            "Station Code": "MEF",
            "Station ID": 20,
            "Chinese Name": "美孚",
            "English Name": "Mei Foo",
            "Sequence": 20
          },
          {
            "Line Code": "TML",
            "Direction": "UT",
            "Station Code": "TWW",
            "Station ID": 114,
            "Chinese Name": "荃灣西",
            "English Name": "Tsuen Wan West",
            "Sequence": 21
          },
          {
            "Line Code": "TML",
            "Direction": "UT",
            "Station Code": "KSR",
            "Station ID": 115,
            "Chinese Name": "錦上路",
            "English Name": "Kam Sheung Road",
            "Sequence": 22
          },
          {
            "Line Code": "TML",
            "Direction": "UT",
            "Station Code": "YUL",
            "Station ID": 116,
            "Chinese Name": "元朗",
            "English Name": "Yuen Long",
            "Sequence": 23
          },
          {
            "Line Code": "TML",
            "Direction": "UT",
            "Station Code": "LOP",
            "Station ID": 117,
            "Chinese Name": "朗屏",
            "English Name": "Long Ping",
            "Sequence": 24
          },
          {
            "Line Code": "TML",
            "Direction": "UT",
            "Station Code": "TIS",
            "Station ID": 118,
            "Chinese Name": "天水圍",
            "English Name": "Tin Shui Wai",
            "Sequence": 25
          },
          {
            "Line Code": "TML",
            "Direction": "UT",
            "Station Code": "SIH",
            "Station ID": 119,
            "Chinese Name": "兆康",
            "English Name": "Siu Hong",
            "Sequence": 26
          },
          {
            "Line Code": "TML",
            "Direction": "UT",
            "Station Code": "TUM",
            "Station ID": 120,
            "Chinese Name": "屯門",
            "English Name": "Tuen Mun",
            "Sequence": 27
          },
          {
            "Line Code": "TML",
            "Direction": "DT",
            "Station Code": "TUM",
            "Station ID": 120,
            "Chinese Name": "屯門",
            "English Name": "Tuen Mun",
            "Sequence": 1
          },
          {
            "Line Code": "TML",
            "Direction": "DT",
            "Station Code": "SIH",
            "Station ID": 119,
            "Chinese Name": "兆康",
            "English Name": "Siu Hong",
            "Sequence": 2
          },
          {
            "Line Code": "TML",
            "Direction": "DT",
            "Station Code": "TIS",
            "Station ID": 118,
            "Chinese Name": "天水圍",
            "English Name": "Tin Shui Wai",
            "Sequence": 3
          },
          {
            "Line Code": "TML",
            "Direction": "DT",
            "Station Code": "LOP",
            "Station ID": 117,
            "Chinese Name": "朗屏",
            "English Name": "Long Ping",
            "Sequence": 4
          },
          {
            "Line Code": "TML",
            "Direction": "DT",
            "Station Code": "YUL",
            "Station ID": 116,
            "Chinese Name": "元朗",
            "English Name": "Yuen Long",
            "Sequence": 5
          },
          {
            "Line Code": "TML",
            "Direction": "DT",
            "Station Code": "KSR",
            "Station ID": 115,
            "Chinese Name": "錦上路",
            "English Name": "Kam Sheung Road",
            "Sequence": 6
          },
          {
            "Line Code": "TML",
            "Direction": "DT",
            "Station Code": "TWW",
            "Station ID": 114,
            "Chinese Name": "荃灣西",
            "English Name": "Tsuen Wan West",
            "Sequence": 7
          },
          {
            "Line Code": "TML",
            "Direction": "DT",
            "Station Code": "MEF",
            "Station ID": 20,
            "Chinese Name": "美孚",
            "English Name": "Mei Foo",
            "Sequence": 8
          },
          {
            "Line Code": "TML",
            "Direction": "DT",
            "Station Code": "NAC",
            "Station ID": 53,
            "Chinese Name": "南昌",
            "English Name": "Nam Cheong",
            "Sequence": 9
          },
          {
            "Line Code": "TML",
            "Direction": "DT",
            "Station Code": "AUS",
            "Station ID": 111,
            "Chinese Name": "柯士甸",
            "English Name": "Austin",
            "Sequence": 10
          },
          {
            "Line Code": "TML",
            "Direction": "DT",
            "Station Code": "ETS",
            "Station ID": 80,
            "Chinese Name": "尖東",
            "English Name": "East Tsim Sha Tsui",
            "Sequence": 11
          },
          {
            "Line Code": "TML",
            "Direction": "DT",
            "Station Code": "HUH",
            "Station ID": 64,
            "Chinese Name": "紅磡",
            "English Name": "Hung Hom",
            "Sequence": 12
          },
          {
            "Line Code": "TML",
            "Direction": "DT",
            "Station Code": "HOM",
            "Station ID": 84,
            "Chinese Name": "何文田",
            "English Name": "Ho Man Tin",
            "Sequence": 13
          },
          {
            "Line Code": "TML",
            "Direction": "DT",
            "Station Code": "TKW",
            "Station ID": 93,
            "Chinese Name": "土瓜灣",
            "English Name": "To Kwa Wan",
            "Sequence": 14
          },
          {
            "Line Code": "TML",
            "Direction": "DT",
            "Station Code": "SUW",
            "Station ID": 92,
            "Chinese Name": "宋皇臺",
            "English Name": "Sung Wong Toi",
            "Sequence": 15
          },
          {
            "Line Code": "TML",
            "Direction": "DT",
            "Station Code": "KAT",
            "Station ID": 91,
            "Chinese Name": "啟德",
            "English Name": "Kai Tak",
            "Sequence": 16
          },
          {
            "Line Code": "TML",
            "Direction": "DT",
            "Station Code": "DIH",
            "Station ID": 11,
            "Chinese Name": "鑽石山",
            "English Name": "Diamond Hill",
            "Sequence": 17
          },
          {
            "Line Code": "TML",
            "Direction": "DT",
            "Station Code": "HIK",
            "Station ID": 90,
            "Chinese Name": "顯徑",
            "English Name": "Hin Keng",
            "Sequence": 18
          },
          {
            "Line Code": "TML",
            "Direction": "DT",
            "Station Code": "TAW",
            "Station ID": 67,
            "Chinese Name": "大圍",
            "English Name": "Tai Wai",
            "Sequence": 19
          },
          {
            "Line Code": "TML",
            "Direction": "DT",
            "Station Code": "CKT",
            "Station ID": 96,
            "Chinese Name": "車公廟",
            "English Name": "Che Kung Temple",
            "Sequence": 20
          },
          {
            "Line Code": "TML",
            "Direction": "DT",
            "Station Code": "STW",
            "Station ID": 97,
            "Chinese Name": "沙田圍",
            "English Name": "Sha Tin Wai",
            "Sequence": 21
          },
          {
            "Line Code": "TML",
            "Direction": "DT",
            "Station Code": "CIO",
            "Station ID": 98,
            "Chinese Name": "第一城",
            "English Name": "City One",
            "Sequence": 22
          },
          {
            "Line Code": "TML",
            "Direction": "DT",
            "Station Code": "SHM",
            "Station ID": 99,
            "Chinese Name": "石門",
            "English Name": "Shek Mun",
            "Sequence": 23
          },
          {
            "Line Code": "TML",
            "Direction": "DT",
            "Station Code": "TSH",
            "Station ID": 100,
            "Chinese Name": "大水坑",
            "English Name": "Tai Shui Hang",
            "Sequence": 24
          },
          {
            "Line Code": "TML",
            "Direction": "DT",
            "Station Code": "HEO",
            "Station ID": 101,
            "Chinese Name": "恆安",
            "English Name": "Heng On",
            "Sequence": 25
          },
          {
            "Line Code": "TML",
            "Direction": "DT",
            "Station Code": "MOS",
            "Station ID": 102,
            "Chinese Name": "馬鞍山",
            "English Name": "Ma On Shan",
            "Sequence": 26
          },
          {
            "Line Code": "TML",
            "Direction": "DT",
            "Station Code": "WKS",
            "Station ID": 103,
            "Chinese Name": "烏溪沙",
            "English Name": "Wu Kai Sha",
            "Sequence": 27
          },
          {
            "Line Code": "TCL",
            "Direction": "DT",
            "Station Code": "TUC",
            "Station ID": 43,
            "Chinese Name": "東涌",
            "English Name": "Tung Chung",
            "Sequence": 1
          },
          {
            "Line Code": "TCL",
            "Direction": "DT",
            "Station Code": "SUN",
            "Station ID": 54,
            "Chinese Name": "欣澳",
            "English Name": "Sunny Bay",
            "Sequence": 2
          },
          {
            "Line Code": "TCL",
            "Direction": "DT",
            "Station Code": "TSY",
            "Station ID": 42,
            "Chinese Name": "青衣",
            "English Name": "Tsing Yi",
            "Sequence": 3
          },
          {
            "Line Code": "TCL",
            "Direction": "DT",
            "Station Code": "LAK",
            "Station ID": 21,
            "Chinese Name": "茘景",
            "English Name": "Lai King",
            "Sequence": 4
          },
          {
            "Line Code": "TCL",
            "Direction": "DT",
            "Station Code": "NAC",
            "Station ID": 53,
            "Chinese Name": "南昌",
            "English Name": "Nam Cheong",
            "Sequence": 5
          },
          {
            "Line Code": "TCL",
            "Direction": "DT",
            "Station Code": "OLY",
            "Station ID": 41,
            "Chinese Name": "奧運",
            "English Name": "Olympic",
            "Sequence": 6
          },
          {
            "Line Code": "TCL",
            "Direction": "DT",
            "Station Code": "KOW",
            "Station ID": 40,
            "Chinese Name": "九龍",
            "English Name": "Kowloon",
            "Sequence": 7
          },
          {
            "Line Code": "TCL",
            "Direction": "DT",
            "Station Code": "HOK",
            "Station ID": 39,
            "Chinese Name": "香港",
            "English Name": "Hong Kong",
            "Sequence": 8
          },
          {
            "Line Code": "TCL",
            "Direction": "UT",
            "Station Code": "HOK",
            "Station ID": 39,
            "Chinese Name": "香港",
            "English Name": "Hong Kong",
            "Sequence": 1
          },
          {
            "Line Code": "TCL",
            "Direction": "UT",
            "Station Code": "KOW",
            "Station ID": 40,
            "Chinese Name": "九龍",
            "English Name": "Kowloon",
            "Sequence": 2
          },
          {
            "Line Code": "TCL",
            "Direction": "UT",
            "Station Code": "OLY",
            "Station ID": 41,
            "Chinese Name": "奧運",
            "English Name": "Olympic",
            "Sequence": 3
          },
          {
            "Line Code": "TCL",
            "Direction": "UT",
            "Station Code": "NAC",
            "Station ID": 53,
            "Chinese Name": "南昌",
            "English Name": "Nam Cheong",
            "Sequence": 4
          },
          {
            "Line Code": "TCL",
            "Direction": "UT",
            "Station Code": "LAK",
            "Station ID": 21,
            "Chinese Name": "茘景",
            "English Name": "Lai King",
            "Sequence": 5
          },
          {
            "Line Code": "TCL",
            "Direction": "UT",
            "Station Code": "TSY",
            "Station ID": 42,
            "Chinese Name": "青衣",
            "English Name": "Tsing Yi",
            "Sequence": 6
          },
          {
            "Line Code": "TCL",
            "Direction": "UT",
            "Station Code": "SUN",
            "Station ID": 54,
            "Chinese Name": "欣澳",
            "English Name": "Sunny Bay",
            "Sequence": 7
          },
          {
            "Line Code": "TCL",
            "Direction": "UT",
            "Station Code": "TUC",
            "Station ID": 43,
            "Chinese Name": "東涌",
            "English Name": "Tung Chung",
            "Sequence": 8
          },
          {
            "Line Code": "TKL",
            "Direction": "DT",
            "Station Code": "POA",
            "Station ID": 52,
            "Chinese Name": "寶琳",
            "English Name": "Po Lam",
            "Sequence": 1
          },
          {
            "Line Code": "TKL",
            "Direction": "DT",
            "Station Code": "HAH",
            "Station ID": 51,
            "Chinese Name": "坑口",
            "English Name": "Hang Hau",
            "Sequence": 2
          },
          {
            "Line Code": "TKL",
            "Direction": "DT",
            "Station Code": "TKO",
            "Station ID": 50,
            "Chinese Name": "將軍澳",
            "English Name": "Tseung Kwan O",
            "Sequence": 3
          },
          {
            "Line Code": "TKL",
            "Direction": "DT",
            "Station Code": "TIK",
            "Station ID": 49,
            "Chinese Name": "調景嶺",
            "English Name": "Tiu Keng Leng",
            "Sequence": 4
          },
          {
            "Line Code": "TKL",
            "Direction": "DT",
            "Station Code": "YAT",
            "Station ID": 48,
            "Chinese Name": "油塘",
            "English Name": "Yau Tong",
            "Sequence": 5
          },
          {
            "Line Code": "TKL",
            "Direction": "DT",
            "Station Code": "QUB",
            "Station ID": 32,
            "Chinese Name": "鰂魚涌",
            "English Name": "Quarry Bay",
            "Sequence": 6
          },
          {
            "Line Code": "TKL",
            "Direction": "DT",
            "Station Code": "NOP",
            "Station ID": 31,
            "Chinese Name": "北角",
            "English Name": "North Point",
            "Sequence": 7
          },
          {
            "Line Code": "TKL",
            "Direction": "TKS-DT",
            "Station Code": "LHP",
            "Station ID": 57,
            "Chinese Name": "康城",
            "English Name": "LOHAS Park",
            "Sequence": 1
          },
          {
            "Line Code": "TKL",
            "Direction": "TKS-DT",
            "Station Code": "TKO",
            "Station ID": 50,
            "Chinese Name": "將軍澳",
            "English Name": "Tseung Kwan O",
            "Sequence": 2
          },
          {
            "Line Code": "TKL",
            "Direction": "TKS-DT",
            "Station Code": "TIK",
            "Station ID": 49,
            "Chinese Name": "調景嶺",
            "English Name": "Tiu Keng Leng",
            "Sequence": 3
          },
          {
            "Line Code": "TKL",
            "Direction": "TKS-UT",
            "Station Code": "TIK",
            "Station ID": 49,
            "Chinese Name": "調景嶺",
            "English Name": "Tiu Keng Leng",
            "Sequence": 1
          },
          {
            "Line Code": "TKL",
            "Direction": "TKS-UT",
            "Station Code": "TKO",
            "Station ID": 50,
            "Chinese Name": "將軍澳",
            "English Name": "Tseung Kwan O",
            "Sequence": 2
          },
          {
            "Line Code": "TKL",
            "Direction": "TKS-UT",
            "Station Code": "LHP",
            "Station ID": 57,
            "Chinese Name": "康城",
            "English Name": "LOHAS Park",
            "Sequence": 3
          },
          {
            "Line Code": "TKL",
            "Direction": "UT",
            "Station Code": "NOP",
            "Station ID": 31,
            "Chinese Name": "北角",
            "English Name": "North Point",
            "Sequence": 1
          },
          {
            "Line Code": "TKL",
            "Direction": "UT",
            "Station Code": "QUB",
            "Station ID": 32,
            "Chinese Name": "鰂魚涌",
            "English Name": "Quarry Bay",
            "Sequence": 2
          },
          {
            "Line Code": "TKL",
            "Direction": "UT",
            "Station Code": "YAT",
            "Station ID": 48,
            "Chinese Name": "油塘",
            "English Name": "Yau Tong",
            "Sequence": 3
          },
          {
            "Line Code": "TKL",
            "Direction": "UT",
            "Station Code": "TIK",
            "Station ID": 49,
            "Chinese Name": "調景嶺",
            "English Name": "Tiu Keng Leng",
            "Sequence": 4
          },
          {
            "Line Code": "TKL",
            "Direction": "UT",
            "Station Code": "TKO",
            "Station ID": 50,
            "Chinese Name": "將軍澳",
            "English Name": "Tseung Kwan O",
            "Sequence": 5
          },
          {
            "Line Code": "TKL",
            "Direction": "UT",
            "Station Code": "HAH",
            "Station ID": 51,
            "Chinese Name": "坑口",
            "English Name": "Hang Hau",
            "Sequence": 6
          },
          {
            "Line Code": "TKL",
            "Direction": "UT",
            "Station Code": "POA",
            "Station ID": 52,
            "Chinese Name": "寶琳",
            "English Name": "Po Lam",
            "Sequence": 7
          },
          {
            "Line Code": "TWL",
            "Direction": "DT",
            "Station Code": "TSW",
            "Station ID": 25,
            "Chinese Name": "荃灣",
            "English Name": "Tsuen Wan",
            "Sequence": 1
          },
          {
            "Line Code": "TWL",
            "Direction": "DT",
            "Station Code": "TWH",
            "Station ID": 24,
            "Chinese Name": "大窩口",
            "English Name": "Tai Wo Hau",
            "Sequence": 2
          },
          {
            "Line Code": "TWL",
            "Direction": "DT",
            "Station Code": "KWH",
            "Station ID": 23,
            "Chinese Name": "葵興",
            "English Name": "Kwai Hing",
            "Sequence": 3
          },
          {
            "Line Code": "TWL",
            "Direction": "DT",
            "Station Code": "KWF",
            "Station ID": 22,
            "Chinese Name": "葵芳",
            "English Name": "Kwai Fong",
            "Sequence": 4
          },
          {
            "Line Code": "TWL",
            "Direction": "DT",
            "Station Code": "LAK",
            "Station ID": 21,
            "Chinese Name": "茘景",
            "English Name": "Lai King",
            "Sequence": 5
          },
          {
            "Line Code": "TWL",
            "Direction": "DT",
            "Station Code": "MEF",
            "Station ID": 20,
            "Chinese Name": "美孚",
            "English Name": "Mei Foo",
            "Sequence": 6
          },
          {
            "Line Code": "TWL",
            "Direction": "DT",
            "Station Code": "LCK",
            "Station ID": 19,
            "Chinese Name": "茘枝角",
            "English Name": "Lai Chi Kok",
            "Sequence": 7
          },
          {
            "Line Code": "TWL",
            "Direction": "DT",
            "Station Code": "CSW",
            "Station ID": 18,
            "Chinese Name": "長沙灣",
            "English Name": "Cheung Sha Wan",
            "Sequence": 8
          },
          {
            "Line Code": "TWL",
            "Direction": "DT",
            "Station Code": "SSP",
            "Station ID": 17,
            "Chinese Name": "深水埗",
            "English Name": "Sham Shui Po",
            "Sequence": 9
          },
          {
            "Line Code": "TWL",
            "Direction": "DT",
            "Station Code": "PRE",
            "Station ID": 16,
            "Chinese Name": "太子",
            "English Name": "Prince Edward",
            "Sequence": 10
          },
          {
            "Line Code": "TWL",
            "Direction": "DT",
            "Station Code": "MOK",
            "Station ID": 6,
            "Chinese Name": "旺角",
            "English Name": "Mong Kok",
            "Sequence": 11
          },
          {
            "Line Code": "TWL",
            "Direction": "DT",
            "Station Code": "YMT",
            "Station ID": 5,
            "Chinese Name": "油麻地",
            "English Name": "Yau Ma Tei",
            "Sequence": 12
          },
          {
            "Line Code": "TWL",
            "Direction": "DT",
            "Station Code": "JOR",
            "Station ID": 4,
            "Chinese Name": "佐敦",
            "English Name": "Jordan",
            "Sequence": 13
          },
          {
            "Line Code": "TWL",
            "Direction": "DT",
            "Station Code": "TST",
            "Station ID": 3,
            "Chinese Name": "尖沙咀",
            "English Name": "Tsim Sha Tsui",
            "Sequence": 14
          },
          {
            "Line Code": "TWL",
            "Direction": "DT",
            "Station Code": "ADM",
            "Station ID": 2,
            "Chinese Name": "金鐘",
            "English Name": "Admiralty",
            "Sequence": 15
          },
          {
            "Line Code": "TWL",
            "Direction": "DT",
            "Station Code": "CEN",
            "Station ID": 1,
            "Chinese Name": "中環",
            "English Name": "Central",
            "Sequence": 16
          },
          {
            "Line Code": "TWL",
            "Direction": "UT",
            "Station Code": "CEN",
            "Station ID": 1,
            "Chinese Name": "中環",
            "English Name": "Central",
            "Sequence": 1
          },
          {
            "Line Code": "TWL",
            "Direction": "UT",
            "Station Code": "ADM",
            "Station ID": 2,
            "Chinese Name": "金鐘",
            "English Name": "Admiralty",
            "Sequence": 2
          },
          {
            "Line Code": "TWL",
            "Direction": "UT",
            "Station Code": "TST",
            "Station ID": 3,
            "Chinese Name": "尖沙咀",
            "English Name": "Tsim Sha Tsui",
            "Sequence": 3
          },
          {
            "Line Code": "TWL",
            "Direction": "UT",
            "Station Code": "JOR",
            "Station ID": 4,
            "Chinese Name": "佐敦",
            "English Name": "Jordan",
            "Sequence": 4
          },
          {
            "Line Code": "TWL",
            "Direction": "UT",
            "Station Code": "YMT",
            "Station ID": 5,
            "Chinese Name": "油麻地",
            "English Name": "Yau Ma Tei",
            "Sequence": 5
          },
          {
            "Line Code": "TWL",
            "Direction": "UT",
            "Station Code": "MOK",
            "Station ID": 6,
            "Chinese Name": "旺角",
            "English Name": "Mong Kok",
            "Sequence": 6
          },
          {
            "Line Code": "TWL",
            "Direction": "UT",
            "Station Code": "PRE",
            "Station ID": 16,
            "Chinese Name": "太子",
            "English Name": "Prince Edward",
            "Sequence": 7
          },
          {
            "Line Code": "TWL",
            "Direction": "UT",
            "Station Code": "SSP",
            "Station ID": 17,
            "Chinese Name": "深水埗",
            "English Name": "Sham Shui Po",
            "Sequence": 8
          },
          {
            "Line Code": "TWL",
            "Direction": "UT",
            "Station Code": "CSW",
            "Station ID": 18,
            "Chinese Name": "長沙灣",
            "English Name": "Cheung Sha Wan",
            "Sequence": 9
          },
          {
            "Line Code": "TWL",
            "Direction": "UT",
            "Station Code": "LCK",
            "Station ID": 19,
            "Chinese Name": "茘枝角",
            "English Name": "Lai Chi Kok",
            "Sequence": 10
          },
          {
            "Line Code": "TWL",
            "Direction": "UT",
            "Station Code": "MEF",
            "Station ID": 20,
            "Chinese Name": "美孚",
            "English Name": "Mei Foo",
            "Sequence": 11
          },
          {
            "Line Code": "TWL",
            "Direction": "UT",
            "Station Code": "LAK",
            "Station ID": 21,
            "Chinese Name": "茘景",
            "English Name": "Lai King",
            "Sequence": 12
          },
          {
            "Line Code": "TWL",
            "Direction": "UT",
            "Station Code": "KWF",
            "Station ID": 22,
            "Chinese Name": "葵芳",
            "English Name": "Kwai Fong",
            "Sequence": 13
          },
          {
            "Line Code": "TWL",
            "Direction": "UT",
            "Station Code": "KWH",
            "Station ID": 23,
            "Chinese Name": "葵興",
            "English Name": "Kwai Hing",
            "Sequence": 14
          },
          {
            "Line Code": "TWL",
            "Direction": "UT",
            "Station Code": "TWH",
            "Station ID": 24,
            "Chinese Name": "大窩口",
            "English Name": "Tai Wo Hau",
            "Sequence": 15
          },
          {
            "Line Code": "TWL",
            "Direction": "UT",
            "Station Code": "TSW",
            "Station ID": 25,
            "Chinese Name": "荃灣",
            "English Name": "Tsuen Wan",
            "Sequence": 16
          },
          {
            "Line Code": "SIL",
            "Direction": "UT",
            "Station Code": "ADM",
            "Station ID": 2,
            "Chinese Name": "金鐘",
            "English Name": "Admiralty",
            "Sequence": 1
          },
          {
            "Line Code": "SIL",
            "Direction": "UT",
            "Station Code": "OCP",
            "Station ID": 86,
            "Chinese Name": "海洋公園",
            "English Name": "Ocean Park",
            "Sequence": 2
          },
          {
            "Line Code": "SIL",
            "Direction": "UT",
            "Station Code": "WCH",
            "Station ID": 87,
            "Chinese Name": "黃竹坑",
            "English Name": "Wong Chuk Hang",
            "Sequence": 3
          },
          {
            "Line Code": "SIL",
            "Direction": "UT",
            "Station Code": "LET",
            "Station ID": 88,
            "Chinese Name": "利東",
            "English Name": "Lei Tung",
            "Sequence": 4
          },
          {
            "Line Code": "SIL",
            "Direction": "UT",
            "Station Code": "SOH",
            "Station ID": 89,
            "Chinese Name": "海怡半島",
            "English Name": "South Horizons",
            "Sequence": 5
          },
          {
            "Line Code": "SIL",
            "Direction": "DT",
            "Station Code": "SOH",
            "Station ID": 89,
            "Chinese Name": "海怡半島",
            "English Name": "South Horizons",
            "Sequence": 1
          },
          {
            "Line Code": "SIL",
            "Direction": "DT",
            "Station Code": "LET",
            "Station ID": 88,
            "Chinese Name": "利東",
            "English Name": "Lei Tung",
            "Sequence": 2
          },
          {
            "Line Code": "SIL",
            "Direction": "DT",
            "Station Code": "WCH",
            "Station ID": 87,
            "Chinese Name": "黃竹坑",
            "English Name": "Wong Chuk Hang",
            "Sequence": 3
          },
          {
            "Line Code": "SIL",
            "Direction": "DT",
            "Station Code": "OCP",
            "Station ID": 86,
            "Chinese Name": "海洋公園",
            "English Name": "Ocean Park",
            "Sequence": 4
          },
          {
            "Line Code": "SIL",
            "Direction": "DT",
            "Station Code": "ADM",
            "Station ID": 2,
            "Chinese Name": "金鐘",
            "English Name": "Admiralty",
            "Sequence": 5
          }
    ]
};

const MTR_LINES = [
    { 
        code: 'AEL', 
        name_en: 'Airport Express', 
        name_tc: '機場快線',
        color: '#00888D'
    },
    { 
        code: 'TCL', 
        name_en: 'Tung Chung Line', 
        name_tc: '東涌綫',
        color: '#F7943E'
    },
    { 
        code: 'TML', 
        name_en: 'Tuen Ma Line', 
        name_tc: '屯馬綫',
        color: '#9C2E00'
    },
    { 
        code: 'TKL', 
        name_en: 'Tseung Kwan O Line', 
        name_tc: '將軍澳綫',
        color: '#7E3C93'
    },
    { 
        code: 'EAL', 
        name_en: 'East Rail Line', 
        name_tc: '東鐵綫',
        color: '#5BB7E5'
    },
    { 
        code: 'SIL', 
        name_en: 'South Island Line', 
        name_tc: '南港島綫',
        color: '#CBD300'
    },
    { 
        code: 'TWL', 
        name_en: 'Tsuen Wan Line', 
        name_tc: '荃灣綫',
        color: '#E2231A'
    },
    { 
        code: 'ISL', 
        name_en: 'Island Line', 
        name_tc: '港島綫',
        color: '#0075C2'
    },
    { 
        code: 'KTL', 
        name_en: 'Kwun Tong Line', 
        name_tc: '觀塘綫',
        color: '#00A040'
    }
];

const CACHE_KEYS = {
    STATIONS: '@mtr_lines_stations',
    LAST_UPDATE: '@mtr_last_update',
};

class MTRService {
    constructor() {
        this.initialized = false;
        this.stations = null;
        this.lastUpdate = null;
    }

    getAllLines() {
        return MTR_LINES;
    }

    async initialize() {
        if (this.initialized) return;

        try {
            // Try to load from cache first
            const [cachedStationsStr, lastUpdateStr] = await Promise.all([
                AsyncStorage.getItem(CACHE_KEYS.STATIONS),
                AsyncStorage.getItem(CACHE_KEYS.LAST_UPDATE)
            ]);

            const cachedStations = cachedStationsStr ? JSON.parse(cachedStationsStr) : null;
            const lastUpdate = lastUpdateStr ? new Date(JSON.parse(lastUpdateStr)) : null;

            // Check if cache is valid (less than 24 hours old)
            const cacheIsValid = lastUpdate && 
                (new Date().getTime() - lastUpdate.getTime() < 24 * 60 * 60 * 1000) &&
                cachedStations;

            if (cacheIsValid) {
                this.stations = cachedStations;
                this.lastUpdate = lastUpdate;
            } else {
                // If cache is invalid or missing, process the station data
                const processedStations = this.processStationData();
                
                if (!processedStations || processedStations.length === 0) {
                    throw new Error('No station data available');
                }

                // Save to cache
                await Promise.all([
                    AsyncStorage.setItem(CACHE_KEYS.STATIONS, JSON.stringify(processedStations)),
                    AsyncStorage.setItem(CACHE_KEYS.LAST_UPDATE, JSON.stringify(new Date()))
                ]);

                this.stations = processedStations;
                this.lastUpdate = new Date();
            }

            this.initialized = true;
        } catch (error) {
            console.error('Error updating MTR cache:', error);
            throw error;
        }
    }

    processStationData() {
        try {
            // Use the static data instead of importing JSON
            const stationsData = MTR_STATIONS_DATA.fares;
            
            if (!stationsData || !Array.isArray(stationsData)) {
                throw new Error('Invalid station data format');
            }

            // Transform the data into a more usable format
            return stationsData.map(station => ({
                Line_Code: station['Line Code'],
                Direction: station.Direction,
                Station_Code: station['Station Code'],
                Station_ID: station['Station ID'],
                Chinese_Name: station['Chinese Name'],
                English_Name: station['English Name'],
                Sequence: station.Sequence
            }));
        } catch (error) {
            console.error('Error processing station data:', error);
            return null;
        }
    }

    getLineStations(lineCode, direction = 'DT') {
        if (!this.initialized || !this.stations) {
            throw new Error('MTR Service not initialized');
        }

        // Filter stations for the specified line and direction
        const lineStations = this.stations
            .filter(station => 
                station.Line_Code === lineCode && 
                station.Direction === direction
            )
            .sort((a, b) => a.Sequence - b.Sequence);

        if (!lineStations.length) {
            throw new Error('No stations found for this line');
        }

        // Now the stations are ordered by sequence for the specific direction
        return lineStations;
    }

    getAllStationsMap() {
        if (!this.initialized || !this.stations) {
            throw new Error('MTR Service not initialized');
        }

        // Create a map of all stations using Station_Code as key
        return this.stations.reduce((map, station) => {
            if (!map[station.Station_Code]) {
                map[station.Station_Code] = station;
            }
            return map;
        }, {});
    }

    async getNextTrains(lineCode, stationCode) {
        try {
            const response = await fetch(
                `https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php?line=${lineCode}&sta=${stationCode}`
            );
            
            if (!response.ok) {
                throw new Error('Failed to fetch train schedules');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching next trains:', error);
            throw error;
        }
    }
}

// Export a singleton instance
export default new MTRService();