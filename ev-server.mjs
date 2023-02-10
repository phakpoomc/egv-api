import { JsonDB, Config } from 'node-json-db';
import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3003;

var db = new JsonDB(new Config("egv-db", true, false, '/'));

await db.push('/paths', [], false);
await db.push('/db', {}, false);
await db.push('/recent', {}, false);
var existedPath = await db.getData('/paths/');

app.use(bodyParser.json());
app.use(cors());
app.set('json spaces', 2);

app.get('/reset', async (req, res) => {
    await db.delete('/paths');
    await db.delete('/db');
    await db.delete('/recent');
    await db.push('/paths', [], false);
    await db.push('/db', {}, false);
    await db.push('/recent', {}, false);

    existedPath = [];
    res.send("Reset Success");
});

app.post('/json', async (req, res) => {
    let dt = new Date();
    let year = String(dt.getFullYear());
    let month = String(dt.getMonth());
    let date = String(dt.getDate());
    let name = req.body.name || "";

    res.setHeader('Content-Type', 'application/json');

    if(name == "")
    {
        res.send("{'status': 'fail'}");
    }
    else
    {
        if(!existedPath.includes("/" + name))
        {
            existedPath.push("/" + name);
        }
        if(!existedPath.includes("/" + name + "/" + year))
        {
            existedPath.push("/" + name + "/" + year);
        }
        if(!existedPath.includes("/" + name + "/" + year + "/" + month))
        {
            existedPath.push("/" + name + "/" + year + "/" + month);
        }
        if(!existedPath.includes("/" + name + "/" + year + "/" + month + '/' + date))
        {
            existedPath.push("/" + name + "/" + year + "/" + month + '/' + date);
        }

        await db.push('/db/' + name + "/" + year + '/' + month + '/' + date + '/list[]', {'time': String(Date.now()), 'data': req.body});
        await db.push('/recent/' + name, {'year': year, 'month': month, 'date': date});
        res.send("{'status': 'success'}");
    }
    
});

app.get('/recent', async (req, res) => {
    let r = await db.getData('/recent');
    res.setHeader('Content-Type', 'application/json');
    res.send(r);
});

app.get('/path', async (req, res) => {
    let r = await db.getData('/paths');
    res.setHeader('Content-Type', 'application/json');
    res.send(r);
});

app.get('/json/:name/:year/:month/:date', async (req, res) => {
    let date = req.params.date;
    let month = req.params.month;
    let year = req.params.year;
    let name = req.params.name;

    res.setHeader('Content-Type', 'application/json');

    if(Number.isInteger(parseInt(date)) && Number.isInteger(parseInt(month)) && Number.isInteger(parseInt(year)) && existedPath.includes("/" + name + "/" + year + '/' + month + '/' + date))
    {
        let data = await db.getData('/db/' + name + "/" + year + '/' + month + '/' + date);

        res.send(JSON.stringify({'status': 'success', 'return': data}, null, 2));
    }
    else
    {
        res.send(JSON.stringify({'status': 'fail'}));
    }
});

app.get('/json/:name/:year/:month/', async (req, res) => {
    let month = req.params.month;
    let year = req.params.year;
    let name = req.params.name;
    res.setHeader('Content-Type', 'application/json');

    if(Number.isInteger(parseInt(month)) && Number.isInteger(parseInt(year)) && existedPath.includes('/' + name + '/' + year + '/' + month))
    {
        let data = await db.getData('/db/' + name + '/' + year + '/' + month);

        res.send(JSON.stringify({'status': 'success', 'return': data}, null, 2));
    }
    else
    {
        res.send(JSON.stringify({'status': 'fail'}));
    }
});

app.get('/json/:name/:year/', async (req, res) => {
    var year = req.params.year;
    var name = req.params.name;
    res.setHeader('Content-Type', 'application/json');

    if(Number.isInteger(parseInt(year)))
    {
        year = parseInt(req.params.year);

        if(year == -1)
        {
            if(existedPath.includes('/' + name))
            {
                let recent = await db.getData('/recent/' + name)
                let date = recent.date;
                let month = recent.month;
                let year = recent.year;

                if(existedPath.includes("/" + name + '/' + year + '/' + month + '/' + date))
                {
                    let data = await db.getData('/db/' + name + '/' + year + '/' + month + '/' + date + '/list[-1]');
                    let y = await db.getData('/db/' + name + '/' + year);
                    let mydata = [0,0,0,0,0,0,0,0,0,0,0,0];
                    let medata = [0,0,0,0,0,0,0,0,0,0,0,0];
                    let dydata = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
                    let dedata = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

                    // for(let m of Object.keys(y))
                    // {
                    //     for(let d of Object.keys(y[m]))
                    //     {
                    //         let sumDayYield = 0;
                    //         let sumDayEnergy = 0;

                    //         console.log(d);

                    //         for(let l of y[m][d].list)
                    //         {
                    //             console.log(l);
                    //             dydata[d] += l.data.pages.page1.TREND_YIELD_AND_ENERGY_TOTAL.in_trend_ye_chart.yield;
                    //             dedata[d] += l.data.pages.page1.TREND_YIELD_AND_ENERGY_TOTAL.in_trend_ye_chart.energy;
                    //         }

                    //         mydata[m] += dydata[d];
                    //         medata[m] += dedata[d];
                    //     }
                    // }


                    for(let d = 0; d<31; d++)
                    {
                        dydata[d] += Math.floor(Math.random() * 5000);
                        dedata[d] += Math.floor(Math.random() * 5000);
                    }
                    for(let m = 0; m<12; m++)
                    {
                        mydata[m] += Math.floor(Math.random() * 5000);
                        medata[m] += Math.floor(Math.random() * 5000);
                    }
                
                    res.send(JSON.stringify({'status': 'success', 'return': data, 'graph': {'monthly': {'yield': mydata, 'energy': medata}, 'daily': {'yield': dydata, 'energy': dedata}}}, null, 2));
                }
                else
                {
                    res.send(JSON.stringify({'status': 'fail'}));
                }
            }
            else
            {
                res.send(JSON.stringify({'status': 'fail'}));
            }
            
        }
        else if(year > -1  && existedPath.includes("/" + name + '/' + year))
        {
            let data = await db.getData('/db/' + name + '/' + String(year));

            res.send(JSON.stringify({'status': 'success', 'return': data}, null, 2));
        }
        else
        {
            res.send(JSON.stringify({'status': 'fail'}));
        }
    }
    else
    {
        res.send(JSON.stringify({'status': 'fail'}));
    }
});

app.get('/json/:name/export', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    if(existedPath.includes("/" + req.params.name))
    {
        let e = req.query.energy;
        let p = req.query.production;
        let c = req.query.cycle;
        let t = req.query.type;

        let data = {'export': []};

        if(t == "year")
        {
            // data = await db.getData('/db/' + req.params.name + '/' + y);

            for(let i=0; i<12; i++)
            {
                let o = {'id': i};

                if(e == "true")
                {
                    o['energy'] = Math.floor(Math.random()*100);
                }
                if(p == "true")
                {
                    o['power'] = Math.floor(Math.random()*100);
                }
                if(c == "true")
                {
                    o['cycle'] = Math.floor(Math.random()*100);
                }

                data['export'].push(o);
            }
        }
        else if(t == 'month')
        {
            // data = await db.getData('/db/' + req.params.name + '/' + y + '/' + m);
            for(let i=0; i<31; i++)
            {
                let o = {'id': i};

                if(e == "true")
                {
                    o['energy'] = Math.floor(Math.random()*100);
                }
                if(p == "true")
                {
                    o['power'] = Math.floor(Math.random()*100);
                }
                if(c == "true")
                {
                    o['cycle'] = Math.floor(Math.random()*100);
                }

                data['export'].push(o);
            }
        }
         else
        {
            res.send(JSON.stringify({'status': 'fail'}));
            return;
        }  

        // Process data
        // let data = await db.getData('/db/' + req.params.name);
        res.send(JSON.stringify({'status': 'success', 'return': data}, null, 2));
    }
    else
    {
        res.send(JSON.stringify({'status': 'fail'}));
    }   

});

app.get('/json/:name/spc', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    if(existedPath.includes("/" + req.params.name))
    {
        // let y = req.query.year;
        // let m = req.query.month;
        // let d = req.query.date;

        // let data = await db.getData('/db/' + req.params.name + '/' + y + '/' + m + '/' + d);

        let s = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        let p = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        let c = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        // Process data

        for(let i=0; i<24; i++)
        {
            s[i] += Math.floor(Math.random()*10);
            p[i] += Math.floor(Math.random()*10);
            c[i] += Math.floor(Math.random()*10);
        }

        let data = {'speed': s, 'power': p, 'cycle': c};
        
        // let data = await db.getData('/db/' + req.params.name);
        res.send(JSON.stringify({'status': 'success', 'return': data}, null, 2));
    }
    else
    {
        res.send(JSON.stringify({'status': 'fail'}));
    }   

});


app.get('/json/:name', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    if(existedPath.includes("/" + req.params.name))
    {
        let data = await db.getData('/db/' + req.params.name);
        res.send(JSON.stringify({'status': 'success', 'return': data}, null, 2));
    }
    else
    {
        res.send(JSON.stringify({'status': 'fail'}));
    }   
});

app.get('/json', async (req, res) => {
    let allData = await db.getData('/db');
    res.setHeader('Content-Type', 'application/json');

    res.send(JSON.stringify({'status': 'success', 'return': allData}));
        
});

app.listen(port, () => {
    console.log("Server started");
});