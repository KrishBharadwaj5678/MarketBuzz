let search=document.querySelector("input.stocks");
let btn=document.querySelector("button.btn");
let stock_parent=document.querySelector("div.stock-details");
let top_gainer_loser=document.querySelector("table.gainers-losers");
let global_market=document.querySelector("table.global-market-table");

let t=gsap.timeline();

t.from("div.top-header",{
    duration:0.5,
    opacity:0
})

t.to("h1.stock_market",{
    text:"Stock Market Tracker",
    duration:1.1
})

t.from("div.gsapfirst,div.search",{
    duration:0.5,
    opacity:0,
    stagger:0.3,
    x:-10
})

t.from("div.gsapsecond,h3.gsap-global-market",{
    opacity:0,
    x:-12
})

t.from("table.gainers-losers,table.global-market-table",{
    opacity:0,
    stagger:0.4
})

t.from("div.gsapthird,h3.gsap-global-status",{
    opacity:0,
    x:-12
})

t.from("div.gsapfourth",{
    opacity:0,
    x:-12
})

async function topgainer(){
    // https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=demo
    let url=await fetch("gainer.json");
    let data=await url.json();
    data["top_gainers"].map((item)=>{
        top_gainer_loser.innerHTML+=`
             <tbody class="global-thead">
              <tr>
                <td class="rows">${item["ticker"]}</td>
                <td class="rows">${item["price"]}</td>
                <td class="rows">${item["change_amount"]}</td>
                <td class="rows">${item["change_percentage"]}</td>
                <td class="rows">${item["volume"]}</td>
              </tr>
            </tbody>
        `
    })
}
topgainer()

// Global Market (https://www.alphavantage.co/query?function=MARKET_STATUS&apikey=demo)
async function globalMarket(){
    let url=await fetch("global.json");
    let data=await url.json();
    data["markets"].map((item)=>{
        global_market.innerHTML+=`
             <tbody class="global-thead">
              <tr>
                <td class="rows">${item["market_type"]}</td>
                <td class="rows">${item["region"]}</td>
                <td class="rows">${item["primary_exchanges"]}</td>
                <td class="rows">${item["local_open"]}</td>
                <td class="rows">${item["local_close"]}</td>
              </tr>
            </tbody>
        `
    })
}
globalMarket()

async function getMaturityRate(){
    // API - https://www.alphavantage.co/query?function=TREASURY_YIELD&interval=monthly&maturity=10year&apikey=demo
    let url=await fetch("maturity.json");
    let data=await url.json();
    let date=[];
    let value=[];
    data["data"].map((item)=>{
        date.push(item["date"].split("-")[0])
        value.push(item["value"])
    })
    var ctx = document.getElementById('myChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: date,
            datasets: [{
                label: 'Maturity Rate',
                data: value,
                fill: true,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0
            }]
        },
        options: {
            animation: {
                duration: 2000,
                easing: 'easeInOutQuart' 
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
getMaturityRate();

let showStockData=(symbol,name,change,prices,open,high,low,close,volume,api)=>{
    stock_parent.style.display="block";
    if(api==1){
        let price=parseFloat(close);
        let formattedPrice=price.toFixed(2);
        convert_currency=`${formattedPrice} USD`;
    }
    else{
        let price=parseFloat(prices);
        let formattedPrice=price.toFixed(2);
        convert_currency=`${formattedPrice} INR`;
    }
    let change_color=change.includes("-")?"red":"#188038";
    let sign=change.includes("-")?"▼":"▲";
    stock_parent.innerHTML=`

            <h3 class="stock_details-head">Stock Details</h3>

            <p class="company-name">${name} (${symbol})</p>

            <p class="stock-price">Price: ${convert_currency}</p>

            <p class="stock-change" style='color:${change_color}'>Change: ${sign}${change}</p>

            <div class="overflow">
                <table class="data-table">
                    <thead>
                    <tr>
                        <th class="cols">Open</th>
                        <th class="cols">High</th>
                        <th class="cols">Low</th>
                        <th class="cols">Close</th>
                        <th class="cols">Volume</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td class="rows">${open}</td>
                        <td class="rows">${high}</td>
                        <td class="rows">${low}</td>
                        <td class="rows">${close}</td>
                        <td class="rows">${volume}</td>
                    </tr>
                    </tbody>
                </table>
            </div>
    `;

    t.from("div.stock-details,h3.stock_details-head,p.company-name,p.stock-price,p.stock-change,table.data-table",{
        opacity:0,
        stagger:0.2,
        duration:1,
        x:-10
    })
}

btn.addEventListener("click",()=>{

    let stock_name=search.value;

    const url = `https://twelve-data1.p.rapidapi.com/quote?symbol=${stock_name}&outputsize=30&format=json&interval=1day`;
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': 'c0e897e06bmshf1b07b02427bc79p1edb79jsn0132d0db5ef9',
            'x-rapidapi-host': 'twelve-data1.p.rapidapi.com'
        }
    };

    try{
        async function getdata(){
            // Fetch Stock US Data
            const response = await fetch(url, options);
            const result = await response.json();
            if(result["code"]==404){
                    // Fetch Stock Indian Data if not exists in US
                    const url = `https://indian-stock-exchange-api2.p.rapidapi.com/stock?name=${stock_name}`;
                    const options = {
                        method: 'GET',
                        headers: {
                            'x-rapidapi-key': 'c0e897e06bmshf1b07b02427bc79p1edb79jsn0132d0db5ef9',
                            'x-rapidapi-host': 'indian-stock-exchange-api2.p.rapidapi.com'
                        }
                    };
                    async function getindiandata(){
                        const response = await fetch(url, options);
                        const result = await response.json();
                        if(result["error"]=="Stock not found"){
                            alert("Stock Data Not Available");    
                        }
                        else{
                            showStockData(result["companyProfile"]["exchangeCodeNse"],result["companyName"],result["stockDetailsReusableData"]["percentChange"],result["stockDetailsReusableData"]["price"],result["futureOverviewData"]["open"],result["stockDetailsReusableData"]["high"],result["stockDetailsReusableData"]["low"],result["stockDetailsReusableData"]["close"],result["futureOverviewData"]["volume"],2)
                        }
                    } 
                    getindiandata();
            }
            else{
               showStockData(result["symbol"],result["name"],result["change"],null,result["open"],result["high"],result["low"],result["close"],result["volume"],1)        
            }
        }
        getdata()
    }
    catch{
        alert("Invalid Stock Symbol!")
    }
})

// <!-- https://www.alphavantage.co/documentation/, apikey=07BSXLBCXWCJ1N37 -->