const fs = require('fs');
const path = require('path');

// Your CSV data as a string
const csvData = `"Line Code","Direction","Station Code","Station ID","Chinese Name","English Name","Sequence"
"AEL","DT","AWE","56","博覽館","AsiaWorld-Expo",1.00
"AEL","DT","AIR","47","機場","Airport",2.00
"AEL","DT","TSY","46","青衣","Tsing Yi",3.00
"AEL","DT","KOW","45","九龍","Kowloon",4.00
"AEL","DT","HOK","44","香港","Hong Kong",5.00
"AEL","UT","HOK","44","香港","Hong Kong",1.00
"AEL","UT","KOW","45","九龍","Kowloon",2.00
"AEL","UT","TSY","46","青衣","Tsing Yi",3.00
"AEL","UT","AIR","47","機場","Airport",4.00
"AEL","UT","AWE","56","博覽館","AsiaWorld-Expo",5.00
"DRL","DT","SUN","54","欣澳","Sunny Bay",1.00
"DRL","DT","DIS","55","迪士尼","Disneyland Resort",2.00
"DRL","UT","DIS","55","迪士尼","Disneyland Resort",1.00
"DRL","UT","SUN","54","欣澳","Sunny Bay",2.00
"EAL","DT","LOW","76","羅湖","Lo Wu",1.00
"EAL","DT","SHS","75","上水","Sheung Shui",2.00
"EAL","DT","FAN","74","粉嶺","Fanling",3.00
"EAL","DT","TWO","73","太和","Tai Wo",4.00
"EAL","DT","TAP","72","大埔墟","Tai Po Market",5.00
"EAL","DT","UNI","71","大學","University",6.00
"EAL","DT","FOT","69","火炭","Fo Tan",7.00
"EAL","DT","SHT","68","沙田","Sha Tin",8.00
"EAL","DT","TAW","67","大圍","Tai Wai",9.00
"EAL","DT","KOT","8","九龍塘","Kowloon Tong",10.00
"EAL","DT","MKK","65","旺角東","Mong Kok East",11.00
"EAL","DT","HUH","64","紅磡","Hung Hom",12.00
"EAL","DT","EXC","94","會展","Exhibition Centre",13.00
"EAL","DT","ADM","2","金鐘","Admiralty",14.00
"EAL","LMC-DT","LMC","78","落馬洲","Lok Ma Chau",1.00
"EAL","LMC-DT","SHS","75","上水","Sheung Shui",2.00
"EAL","LMC-DT","FAN","74","粉嶺","Fanling",3.00
"EAL","LMC-DT","TWO","73","太和","Tai Wo",4.00
"EAL","LMC-DT","TAP","72","大埔墟","Tai Po Market",5.00
"EAL","LMC-DT","UNI","71","大學","University",6.00
"EAL","LMC-DT","FOT","69","火炭","Fo Tan",7.00
"EAL","LMC-DT","SHT","68","沙田","Sha Tin",8.00
"EAL","LMC-DT","TAW","67","大圍","Tai Wai",9.00
"EAL","LMC-DT","KOT","8","九龍塘","Kowloon Tong",10.00
"EAL","LMC-DT","MKK","65","旺角東","Mong Kok East",11.00
"EAL","LMC-DT","HUH","64","紅磡","Hung Hom",12.00
"EAL","LMC-DT","EXC","94","會展","Exhibition Centre",13.00
"EAL","LMC-DT","ADM","2","金鐘","Admiralty",14.00
"EAL","LMC-UT","ADM","2","金鐘","Admiralty",1.00
"EAL","LMC-UT","EXC","94","會展","Exhibition Centre",2.00
"EAL","LMC-UT","HUH","64","紅磡","Hung Hom",3.00
"EAL","LMC-UT","MKK","65","旺角東","Mong Kok East",4.00
"EAL","LMC-UT","KOT","8","九龍塘","Kowloon Tong",5.00
"EAL","LMC-UT","TAW","67","大圍","Tai Wai",6.00
"EAL","LMC-UT","SHT","68","沙田","Sha Tin",7.00
"EAL","LMC-UT","FOT","69","火炭","Fo Tan",8.00
"EAL","LMC-UT","UNI","71","大學","University",9.00
"EAL","LMC-UT","TAP","72","大埔墟","Tai Po Market",10.00
"EAL","LMC-UT","TWO","73","太和","Tai Wo",11.00
"EAL","LMC-UT","FAN","74","粉嶺","Fanling",12.00
"EAL","LMC-UT","SHS","75","上水","Sheung Shui",13.00
"EAL","LMC-UT","LMC","78","落馬洲","Lok Ma Chau",14.00
"EAL","UT","ADM","2","金鐘","Admiralty",1.00
"EAL","UT","EXC","94","會展","Exhibition Centre",2.00
"EAL","UT","HUH","64","紅磡","Hung Hom",3.00
"EAL","UT","MKK","65","旺角東","Mong Kok East",4.00
"EAL","UT","KOT","8","九龍塘","Kowloon Tong",5.00
"EAL","UT","TAW","67","大圍","Tai Wai",6.00
"EAL","UT","SHT","68","沙田","Sha Tin",7.00
"EAL","UT","FOT","69","火炭","Fo Tan",8.00
"EAL","UT","UNI","71","大學","University",9.00
"EAL","UT","TAP","72","大埔墟","Tai Po Market",10.00
"EAL","UT","TWO","73","太和","Tai Wo",11.00
"EAL","UT","FAN","74","粉嶺","Fanling",12.00
"EAL","UT","SHS","75","上水","Sheung Shui",13.00
"EAL","UT","LOW","76","羅湖","Lo Wu",14.00
"ISL","DT","CHW","37","柴灣","Chai Wan",1.00
"ISL","DT","HFC","36","杏花邨","Heng Fa Chuen",2.00
"ISL","DT","SKW","35","筲箕灣","Shau Kei Wan",3.00
"ISL","DT","SWH","34","西灣河","Sai Wan Ho",4.00
"ISL","DT","TAK","33","太古","Tai Koo",5.00
"ISL","DT","QUB","32","鰂魚涌","Quarry Bay",6.00
"ISL","DT","NOP","31","北角","North Point",7.00
"ISL","DT","FOH","30","炮台山","Fortress Hill",8.00
"ISL","DT","TIH","29","天后","Tin Hau",9.00
"ISL","DT","CAB","28","銅鑼灣","Causeway Bay",10.00
"ISL","DT","WAC","27","灣仔","Wan Chai",11.00
"ISL","DT","ADM","2","金鐘","Admiralty",12.00
"ISL","DT","CEN","1","中環","Central",13.00
"ISL","DT","SHW","26","上環","Sheung Wan",14.00
"ISL","DT","SYP","81","西營盤","Sai Ying Pun",15.00
"ISL","DT","HKU","82","香港大學","HKU",16.00
"ISL","DT","KET","83","堅尼地城","Kennedy Town",17.00
"ISL","UT","KET","83","堅尼地城","Kennedy Town",1.00
"ISL","UT","HKU","82","香港大學","HKU",2.00
"ISL","UT","SYP","81","西營盤","Sai Ying Pun",3.00
"ISL","UT","SHW","26","上環","Sheung Wan",4.00
"ISL","UT","CEN","1","中環","Central",5.00
"ISL","UT","ADM","2","金鐘","Admiralty",6.00
"ISL","UT","WAC","27","灣仔","Wan Chai",7.00
"ISL","UT","CAB","28","銅鑼灣","Causeway Bay",8.00
"ISL","UT","TIH","29","天后","Tin Hau",9.00
"ISL","UT","FOH","30","炮台山","Fortress Hill",10.00
"ISL","UT","NOP","31","北角","North Point",11.00
"ISL","UT","QUB","32","鰂魚涌","Quarry Bay",12.00
"ISL","UT","TAK","33","太古","Tai Koo",13.00
"ISL","UT","SWH","34","西灣河","Sai Wan Ho",14.00
"ISL","UT","SKW","35","筲箕灣","Shau Kei Wan",15.00
"ISL","UT","HFC","36","杏花邨","Heng Fa Chuen",16.00
"ISL","UT","CHW","37","柴灣","Chai Wan",17.00
"KTL","DT","TIK","49","調景嶺","Tiu Keng Leng",1.00
"KTL","DT","YAT","48","油塘","Yau Tong",2.00
"KTL","DT","LAT","38","藍田","Lam Tin",3.00
"KTL","DT","KWT","15","觀塘","Kwun Tong",4.00
"KTL","DT","NTK","14","牛頭角","Ngau Tau Kok",5.00
"KTL","DT","KOB","13","九龍灣","Kowloon Bay",6.00
"KTL","DT","CHH","12","彩虹","Choi Hung",7.00
"KTL","DT","DIH","11","鑽石山","Diamond Hill",8.00
"KTL","DT","WTS","10","黃大仙","Wong Tai Sin",9.00
"KTL","DT","LOF","9","樂富","Lok Fu",10.00
"KTL","DT","KOT","8","九龍塘","Kowloon Tong",11.00
"KTL","DT","SKM","7","石硤尾","Shek Kip Mei",12.00
"KTL","DT","PRE","16","太子","Prince Edward",13.00
"KTL","DT","MOK","6","旺角","Mong Kok",14.00
"KTL","DT","YMT","5","油麻地","Yau Ma Tei",15.00
"KTL","DT","HOM","84","何文田","Ho Man Tin",16.00
"KTL","DT","WHA","85","黃埔","Whampoa",17.00
"KTL","UT","WHA","85","黃埔","Whampoa",1.00
"KTL","UT","HOM","84","何文田","Ho Man Tin",2.00
"KTL","UT","YMT","5","油麻地","Yau Ma Tei",3.00
"KTL","UT","MOK","6","旺角","Mong Kok",4.00
"KTL","UT","PRE","16","太子","Prince Edward",5.00
"KTL","UT","SKM","7","石硤尾","Shek Kip Mei",6.00
"KTL","UT","KOT","8","九龍塘","Kowloon Tong",7.00
"KTL","UT","LOF","9","樂富","Lok Fu",8.00
"KTL","UT","WTS","10","黃大仙","Wong Tai Sin",9.00
"KTL","UT","DIH","11","鑽石山","Diamond Hill",10.00
"KTL","UT","CHH","12","彩虹","Choi Hung",11.00
"KTL","UT","KOB","13","九龍灣","Kowloon Bay",12.00
"KTL","UT","NTK","14","牛頭角","Ngau Tau Kok",13.00
"KTL","UT","KWT","15","觀塘","Kwun Tong",14.00
"KTL","UT","LAT","38","藍田","Lam Tin",15.00
"KTL","UT","YAT","48","油塘","Yau Tong",16.00
"KTL","UT","TIK","49","調景嶺","Tiu Keng Leng",17.00
"TML","UT","WKS","103","烏溪沙","Wu Kai Sha",1.00
"TML","UT","MOS","102","馬鞍山","Ma On Shan",2.00
"TML","UT","HEO","101","恆安","Heng On",3.00
"TML","UT","TSH","100","大水坑","Tai Shui Hang",4.00
"TML","UT","SHM","99","石門","Shek Mun",5.00
"TML","UT","CIO","98","第一城","City One",6.00
"TML","UT","STW","97","沙田圍","Sha Tin Wai",7.00
"TML","UT","CKT","96","車公廟","Che Kung Temple",8.00
"TML","UT","TAW","67","大圍","Tai Wai",9.00
"TML","UT","HIK","90","顯徑","Hin Keng",10.00
"TML","UT","DIH","11","鑽石山","Diamond Hill",11.00
"TML","UT","KAT","91","啟德","Kai Tak",12.00
"TML","UT","SUW","92","宋皇臺","Sung Wong Toi",13.00
"TML","UT","TKW","93","土瓜灣","To Kwa Wan",14.00
"TML","UT","HOM","84","何文田","Ho Man Tin",15.00
"TML","UT","HUH","64","紅磡","Hung Hom",16.00
"TML","UT","ETS","80","尖東","East Tsim Sha Tsui",17.00
"TML","UT","AUS","111","柯士甸","Austin",18.00
"TML","UT","NAC","53","南昌","Nam Cheong",19.00
"TML","UT","MEF","20","美孚","Mei Foo",20.00
"TML","UT","TWW","114","荃灣西","Tsuen Wan West",21.00
"TML","UT","KSR","115","錦上路","Kam Sheung Road",22.00
"TML","UT","YUL","116","元朗","Yuen Long",23.00
"TML","UT","LOP","117","朗屏","Long Ping",24.00
"TML","UT","TIS","118","天水圍","Tin Shui Wai",25.00
"TML","UT","SIH","119","兆康","Siu Hong",26.00
"TML","UT","TUM","120","屯門","Tuen Mun",27.00
"TML","DT","TUM","120","屯門","Tuen Mun",1.00
"TML","DT","SIH","119","兆康","Siu Hong",2.00
"TML","DT","TIS","118","天水圍","Tin Shui Wai",3.00
"TML","DT","LOP","117","朗屏","Long Ping",4.00
"TML","DT","YUL","116","元朗","Yuen Long",5.00
"TML","DT","KSR","115","錦上路","Kam Sheung Road",6.00
"TML","DT","TWW","114","荃灣西","Tsuen Wan West",7.00
"TML","DT","MEF","20","美孚","Mei Foo",8.00
"TML","DT","NAC","53","南昌","Nam Cheong",9.00
"TML","DT","AUS","111","柯士甸","Austin",10.00
"TML","DT","ETS","80","尖東","East Tsim Sha Tsui",11.00
"TML","DT","HUH","64","紅磡","Hung Hom",12.00
"TML","DT","HOM","84","何文田","Ho Man Tin",13.00
"TML","DT","TKW","93","土瓜灣","To Kwa Wan",14.00
"TML","DT","SUW","92","宋皇臺","Sung Wong Toi",15.00
"TML","DT","KAT","91","啟德","Kai Tak",16.00
"TML","DT","DIH","11","鑽石山","Diamond Hill",17.00
"TML","DT","HIK","90","顯徑","Hin Keng",18.00
"TML","DT","TAW","67","大圍","Tai Wai",19.00
"TML","DT","CKT","96","車公廟","Che Kung Temple",20.00
"TML","DT","STW","97","沙田圍","Sha Tin Wai",21.00
"TML","DT","CIO","98","第一城","City One",22.00
"TML","DT","SHM","99","石門","Shek Mun",23.00
"TML","DT","TSH","100","大水坑","Tai Shui Hang",24.00
"TML","DT","HEO","101","恆安","Heng On",25.00
"TML","DT","MOS","102","馬鞍山","Ma On Shan",26.00
"TML","DT","WKS","103","烏溪沙","Wu Kai Sha",27.00
"TCL","DT","TUC","43","東涌","Tung Chung",1.00
"TCL","DT","SUN","54","欣澳","Sunny Bay",2.00
"TCL","DT","TSY","42","青衣","Tsing Yi",3.00
"TCL","DT","LAK","21","茘景","Lai King",4.00
"TCL","DT","NAC","53","南昌","Nam Cheong",5.00
"TCL","DT","OLY","41","奧運","Olympic",6.00
"TCL","DT","KOW","40","九龍","Kowloon",7.00
"TCL","DT","HOK","39","香港","Hong Kong",8.00
"TCL","UT","HOK","39","香港","Hong Kong",1.00
"TCL","UT","KOW","40","九龍","Kowloon",2.00
"TCL","UT","OLY","41","奧運","Olympic",3.00
"TCL","UT","NAC","53","南昌","Nam Cheong",4.00
"TCL","UT","LAK","21","茘景","Lai King",5.00
"TCL","UT","TSY","42","青衣","Tsing Yi",6.00
"TCL","UT","SUN","54","欣澳","Sunny Bay",7.00
"TCL","UT","TUC","43","東涌","Tung Chung",8.00
"TKL","DT","POA","52","寶琳","Po Lam",1.00
"TKL","DT","HAH","51","坑口","Hang Hau",2.00
"TKL","DT","TKO","50","將軍澳","Tseung Kwan O",3.00
"TKL","DT","TIK","49","調景嶺","Tiu Keng Leng",4.00
"TKL","DT","YAT","48","油塘","Yau Tong",5.00
"TKL","DT","QUB","32","鰂魚涌","Quarry Bay",6.00
"TKL","DT","NOP","31","北角","North Point",7.00
"TKL","TKS-DT","LHP","57","康城","LOHAS Park",1.00
"TKL","TKS-DT","TKO","50","將軍澳","Tseung Kwan O",2.00
"TKL","TKS-DT","TIK","49","調景嶺","Tiu Keng Leng",3.00
"TKL","TKS-UT","TIK","49","調景嶺","Tiu Keng Leng",1.00
"TKL","TKS-UT","TKO","50","將軍澳","Tseung Kwan O",2.00
"TKL","TKS-UT","LHP","57","康城","LOHAS Park",3.00
"TKL","UT","NOP","31","北角","North Point",1.00
"TKL","UT","QUB","32","鰂魚涌","Quarry Bay",2.00
"TKL","UT","YAT","48","油塘","Yau Tong",3.00
"TKL","UT","TIK","49","調景嶺","Tiu Keng Leng",4.00
"TKL","UT","TKO","50","將軍澳","Tseung Kwan O",5.00
"TKL","UT","HAH","51","坑口","Hang Hau",6.00
"TKL","UT","POA","52","寶琳","Po Lam",7.00
"TWL","DT","TSW","25","荃灣","Tsuen Wan",1.00
"TWL","DT","TWH","24","大窩口","Tai Wo Hau",2.00
"TWL","DT","KWH","23","葵興","Kwai Hing",3.00
"TWL","DT","KWF","22","葵芳","Kwai Fong",4.00
"TWL","DT","LAK","21","茘景","Lai King",5.00
"TWL","DT","MEF","20","美孚","Mei Foo",6.00
"TWL","DT","LCK","19","茘枝角","Lai Chi Kok",7.00
"TWL","DT","CSW","18","長沙灣","Cheung Sha Wan",8.00
"TWL","DT","SSP","17","深水埗","Sham Shui Po",9.00
"TWL","DT","PRE","16","太子","Prince Edward",10.00
"TWL","DT","MOK","6","旺角","Mong Kok",11.00
"TWL","DT","YMT","5","油麻地","Yau Ma Tei",12.00
"TWL","DT","JOR","4","佐敦","Jordan",13.00
"TWL","DT","TST","3","尖沙咀","Tsim Sha Tsui",14.00
"TWL","DT","ADM","2","金鐘","Admiralty",15.00
"TWL","DT","CEN","1","中環","Central",16.00
"TWL","UT","CEN","1","中環","Central",1.00
"TWL","UT","ADM","2","金鐘","Admiralty",2.00
"TWL","UT","TST","3","尖沙咀","Tsim Sha Tsui",3.00
"TWL","UT","JOR","4","佐敦","Jordan",4.00
"TWL","UT","YMT","5","油麻地","Yau Ma Tei",5.00
"TWL","UT","MOK","6","旺角","Mong Kok",6.00
"TWL","UT","PRE","16","太子","Prince Edward",7.00
"TWL","UT","SSP","17","深水埗","Sham Shui Po",8.00
"TWL","UT","CSW","18","長沙灣","Cheung Sha Wan",9.00
"TWL","UT","LCK","19","茘枝角","Lai Chi Kok",10.00
"TWL","UT","MEF","20","美孚","Mei Foo",11.00
"TWL","UT","LAK","21","茘景","Lai King",12.00
"TWL","UT","KWF","22","葵芳","Kwai Fong",13.00
"TWL","UT","KWH","23","葵興","Kwai Hing",14.00
"TWL","UT","TWH","24","大窩口","Tai Wo Hau",15.00
"TWL","UT","TSW","25","荃灣","Tsuen Wan",16.00
"SIL","UT","ADM","2","金鐘","Admiralty",1.00
"SIL","UT","OCP","86","海洋公園","Ocean Park",2.00
"SIL","UT","WCH","87","黃竹坑","Wong Chuk Hang",3.00
"SIL","UT","LET","88","利東","Lei Tung",4.00
"SIL","UT","SOH","89","海怡半島","South Horizons",5.00
"SIL","DT","SOH","89","海怡半島","South Horizons",1.00
"SIL","DT","LET","88","利東","Lei Tung",2.00
"SIL","DT","WCH","87","黃竹坑","Wong Chuk Hang",3.00
"SIL","DT","OCP","86","海洋公園","Ocean Park",4.00
"SIL","DT","ADM","2","金鐘","Admiralty",5.00
`;

function convertCSVToJSON(csvString) {
    // Split the CSV into lines and remove any empty lines
    const lines = csvString.trim().split('\n').filter(line => line.trim());

    // Get headers from first line
    const headers = lines[0].split(',').map(header =>
        header.replace(/"/g, '').trim()
    );

    // Parse data lines
    const fares = lines.slice(1).map(line => {
        const values = line.split(',');
        const fare = {};
        headers.forEach((header, index) => {
            let value = values[index].replace(/"/g, '').trim();
            // Convert numeric values
            if (!isNaN(value) && value !== '') {
                value = parseFloat(value);
            }
            fare[header] = value;
        });
        return fare;
    });

    return {
        fares: fares,
        updated_at: new Date().toISOString()
    };
}

try {
    // Convert the CSV data to JSON
    const jsonData = convertCSVToJSON(csvData);

    // Create the output directory if it doesn't exist
    const outputDir = path.join(__dirname, '..', 'src', 'data', 'mtr');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write to file
    const outputPath = path.join(outputDir, 'mtr_lines_and_stations.json');
    fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2));

    console.log(`✅ Successfully created JSON file at: ${outputPath}`);
    console.log(`📊 Processed ${jsonData.fares.length} fare entries`);
} catch (error) {
    console.error('❌ Error converting CSV to JSON:', error);
}