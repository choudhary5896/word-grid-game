const grid = document.querySelector('.grid');
const box = document.createElement('div');
const bar = document.querySelector('#bar-filled'); 
const score_div = document.querySelector('#score');
const find_word = document.querySelector('#find span');
const msg = document.querySelector('.msg');
const win_container = document.querySelector('.win-container');

const width = Math.max(window.screen.width, window.innerWidth);
const box_size = width <=300 ? 30 : 50;
const box_color = 'lightcoral';
const grid_rows = 5;
const grid_cols = 5;
const max_len = grid_rows + grid_cols;
const max_bends = 3;

const max_score = 150;
var score = 0;
var path_ans;
var word_to_find = 'NULL'; 
var wrong_score = 5;
var correct_score = 10;
var wrong_counter = 0;
var max_wrong_count = 2;
var show_msg = false;
var msg_text = 'Great Work!';
var last_pos = null;

box.className = 'box';
box.appendChild(document.createElement('p'));
box.firstChild.style.pointerEvents = 'none';
box.firstChild.style.userSelect="none";

box.style.cssText = `
    width : ${box_size}px;
    height : ${box_size}px;
    color : white;
    font-size : 25px;
    font-weight : 500;
    display : flex;
    align-items : center;
    justify-content : center;
    padding : 5px;
    background-color : ${box_color};
    transition:  all 0.15s,width 0.3s,height 0.3s ease-in-out;
`;

grid.style.cssText = `
    display: grid;
    gap: 5px;
    grid-template-rows: repeat(${grid_rows}, 1fr);
    grid-template-columns: repeat(${grid_cols}, 1fr);
    height :  ${(box_size+5)*grid_rows -5}px;
    width :  ${(box_size+5)*grid_cols-5}px;
`;

createGrid();
init();

function init()
{
    score = 0;
    path_ans = null;
    word_to_find = 'NULL'; 
    wrong_counter = 0;
    show_msg = false;
    msg_text = 'Great Work!';
    last_pos = null;
    win_container.style.top = '-200%';
    fill_grid();
    updateBar();
}

function createGrid()
{
    for(let i=0;i<grid_cols*grid_rows;i++)
    {
        const cloned_box = box.cloneNode(true);
        cloned_box.setAttribute('id',`${i}`);
        let c = getRandomChar();
        cloned_box.firstChild.textContent = c;
        cloned_box.onclick = grid_clicked;
        grid.appendChild(cloned_box);
    }
    fill_grid();
}

function fill_grid()
{
    let max_len = Math.min(grid_rows,grid_cols);
    let diff = 1,len = 3;

    if(score <50)
    {
        diff = 1,len = 1+random(3);
    }
    else if(score <100)
    {
        diff = 2,len = 2 + random(max_len-2);
    }
    else
    {
        diff = 3,len = 4 + random(max_len-4);
    }
        last_pos = null;
        //fill in easy : {row , col} , medium : {+ rev row , rev col} , hard{ + dig , rev dig}, 
        for(let i=0;i<grid_cols*grid_rows;i++)
        {
            let b = grid.childNodes[i];
            b.style.backgroundColor = getRandomColor();
            b.firstChild.textContent = getRandomChar();
        }
        len = Math.min(len,max_len);
        let word = getRandomWord(len);
        word_to_find = word;
        updateFindWord();
        // console.log(word);
        let method_to_fill = 0;
        
        if(diff == 1) //easy
        {
          method_to_fill = random(2);
        }
        else if(diff == 2) //medium
        {
            method_to_fill = random(4);
        }
        else //hard
        {
            method_to_fill = random(6);
        }
        // console.log(method_to_fill);
        let path = []; //store path to retrive ans
        let x,y;
        if(method_to_fill == 0) //row
        {
             x = random(grid_rows);
             y = random(grid_cols-len);
             for(let i=0;i<len;i++)
                changeValue([x,y+i],word.charAt(i)),path.push([x,y+i]);
        }
        else if(method_to_fill == 1) //col
        {
            x = random(grid_rows-len);
            y = random(grid_cols);
            for(let i=0;i<len;i++)
                changeValue([x+i,y],word.charAt(i)),path.push([x+i,y]);
        }
        else if(method_to_fill == 2) //rev row
        {
            x = random(grid_rows);
            y = grid_cols-1 - random(grid_cols-len+1);
            for(let i=0;i<len;i++)
                changeValue([x,y-i],word.charAt(i)),path.push([x,y-i]);
        }
        else if(method_to_fill == 3) //rev col
        {
            x = grid_rows-1 - random(grid_rows-len+1);
            y = random(grid_cols);
            for(let i=0;i<len;i++)
                changeValue([x-i,y],word.charAt(i)),path.push([x-i,y]);
        }
        else if(method_to_fill == 4) // dig
        {
            x = random(grid_rows-len);
            y = random(grid_cols-len);
            for(let i=0;i<len;i++)
                changeValue([x+i,y+i],word.charAt(i)),path.push([x+i,y+i]);
        }
        else if(method_to_fill == 5) //rev dig
        {
            x = grid_rows-1 - random(grid_rows-len+1);
            y = grid_cols-1 - random(grid_cols-len+1);
            for(let i=0;i<len;i++)
                changeValue([x-i,y-i],word.charAt(i)),path.push([x-i,y-i]);
        }
        // console.log(path);
        path_ans = path;
    show_bulid_animation();
}

function show_bulid_animation()
{
    for(let i=0;i<grid_cols*grid_rows;i++)
    {
        let b = grid.childNodes[i];
        b.style.width = 0;
        b.style.height = 0;
        b.style.fontSize = '0px';
        b.style.opacity = 0;
        setTimeout(()=>{
            b.style.width = `${box_size}px`;
            b.style.height = `${box_size}px`;
            b.style.fontSize = '25px';
            b.style.opacity = 1;
        },500);
    }
    
}

function updateFindWord()
{
    find_word.textContent = word_to_find;
}

function changeValue(pos,c)
{
    let b = get_pos_box(pos);
    b.firstChild.textContent = c;
}

function grid_clicked(b)
{
    b = b.target;
    if(wrong_counter > max_wrong_count)
    {
        wrong_counter = 0;
        score -= wrong_score;
        score = Math.max(0,score);
        msg_text = 'Try Again !';
        msg.textContent = msg_text;
        toggle_msg();
        show_ans();
        setTimeout(()=>{fill_grid();toggle_msg();},1500);
    }
    let p = b.firstChild.textContent; 
    if(isValidClick(b))
    {
        b.style.backgroundColor = '#99FFCD';
        word_to_find = word_to_find.substring(1);
        last_pos = get_pos(b.id);
        if(word_to_find.length == 0)
        {
            wrong_counter = 0;
            score += correct_score;
            msg_text = 'Great Work !';
            msg.textContent = msg_text;
            toggle_msg();
            setTimeout(()=>{fill_grid();toggle_msg();},1500);
            // console.log('win');
        }
    }
    else
    {
        let pcolor = b.style.backgroundColor;
        b.style.backgroundColor = '#F24A72';
        // console.log('not valid');
        wrong_counter ++;
    }
    updateBar();
}

function isValidClick(b)
{
    let c = b.firstChild.textContent;
    let pos = get_pos(b.id);
    let valid = true;
    if(last_pos)
    {
        if((pos[0] == last_pos[0] -1 || pos[0] == last_pos[0] +1) 
            ||(pos[1] == last_pos[1] -1 || pos[1] == last_pos[1] +1))
            valid = true;
        else
            valid = false;
    }
    if(valid && c == word_to_find.charAt(0))
        return true;
    return false;
}

function show_ans()
{
    for(let i=0;i<path_ans.length;i++)
    {
        let pos = path_ans[i];
        // console.log(pos);
        let b = get_pos_box(pos);
        b.style.backgroundColor = '#00FFC6';
    }
}

function toggle_msg() 
{
    show_msg ?  show_msg = false : show_msg = true;
    if(show_msg)
    {
        msg.style.opacity = 1;
    }    
    else
        msg.style.opacity = 0;
}

function updateBar()
{
    score_div.textContent = score;
    score = Math.max(0,score);
    let per = (score/max_score)*100;
    per = Math.min(100,per);
    if(per ==0) per = 3;
    bar.style.width = `${per}%`;
    if(per >= 100) //winning
    {
        setTimeout(()=>{show_win_container();},1000);
    }
}

function show_win_container()
{
    win_container.style.top = '9%';
}


function get_pos(id)
{
    let x = Math.floor(id/grid_rows);
    let y = id - x*grid_rows;
    return [x,y];
}

function get_pos_box(pos)
{
    let x = pos[0],y=pos[1]; // value at xth row and yth col
    if(!(x>=0 && x<grid_rows && y>=0 && y<grid_cols))
        return undefined;
    let ind = x*grid_cols + y; //value of index in grid manner => ind child node of grid
    return grid.childNodes[ind];
}


function random(i)
{
    return Math.floor(Math.random()*i);
}

function getRandomChar()
{
    let chars = 'abcdefghijklmnopqrstuvwxyz'.toUpperCase();
    let x = random(chars.length);
    return chars.charAt(x);
}

function getRandomColor()
{
    let colors = ['#093a3e','#D229AC','#FF3C8A','#FF6A6A','#FF9C54','#FFCC52','#815FE3','#007DF6','#007DF6','#00906E','#8374A7','#00C0E4'];
    return colors[4];
}


function getRandomWord(len)
{
    var x = [
    [],
    
    ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',],
    
    ['to', 'go','do','yo','no','gg','ko','be','me','so','zo'],
    
    ['the','yup',,'gal', 'fax', 'tea', 'lak', 'que', 'ute','zoo', 'zen', 'mum','pop'],
   
    ['null','skew', 'neat', 'fond', 'amok', 'bate', 'buhl', 'ruts', 'axes', 'mock', 'past', 'tony', 'jogs', 'piss',  'aqua', 'buts', 'cate', 'very', 'lila', 'swam', 'sumo', 'glyn', 'devi', 'quad', 'gran', 'agro'],
   
   ['flick', 'modem', 'felts', 'windy', 'madam', 'strip', 'stuck', 'clump', 'livid', 'chess', 'donut', 'laity', 'based', 'duddy', 'jacks', 'caper', 'loves', 'shaky', 'janet', 'bands', 'batik', 'screw', 'darcy', 'ahold', 'uncut', 'bonds', 'slope', 'voice', 'faced', 'steno', 'pants', 'below', 'dalai', 'burnt', 'facet', 'bakes', 'areas', 'emile', 'milks', 'tomes', 'drunk', 'sewed', 'cruse', 'asker', 'nouns', 'silks', 'liege', 'malay', 'grunt', 'hound', 'levis', 'tanya', 'young', 'gabon', 'fuzzy', 'mango', 'merle', 'party', 'lanes', 'pacts', 'sorry', 'zahir', 'marie'],

   ['twists', 'artery', 'rhinos', 'granny', 'freaks', 'shells', 'arsons', 'leaned', 'dished', 'enigma', 'smells', 'johnny', 'loving', 'alicia', 'facets', 'oilers', 'analog', 'cabana', 'queues', 'framer', 'pauper', 'rhymes', 'reveal', 'unwise', 'goggle', 'vernon', 'depots', 'stoked', 'albino', 'vanity', 'prewar', 'retard', 'carnal', 'uncool', 'voiced', 'pedals', 'commas', 'cobras', 'humpty', 'busboy', 'petals', 'eerily', 'surges', 'aurora', 'spiffy', 'naught', 'alaska', 'thrash', 'wooded', 'yakima', 'galena', 'folder', 'moslem', 'unwary', 'grills', 'whoops', 'bodily', 'peddle', 'haired', 'miriam', 'slices', 'rankle', 'topped', 'winner'],
  
   ['strains', 'gestapo', 'thereto', 'egghead', 'parting', 'mustard', 'scooter', 'troupes', 'receded', 'junkets', 'commits', 'slashes', 'bristle', 'descend', 'hydrant', 'tabasco', 'waldorf', 'whitest', 'panning', 'massing', 'decides', 'rebates', 'nightly', 'pronged', 'actuary', 'desired', 'wheeled', 'boolean', 'untruth', 'creases', 'poodles', 'thought', 'puffery', 'undoing', 'reprise', 'talking', 'broadly', 'manages', 'fissile', 'lapping', 'offhand', 'bedevil', 'assures', 'montana', 'speeded', 'spoofed', 'hounded', 'ledgers', 'sockets', 'dangers', 'vitriol', 'legibly', 'titular', 'frontal', 'treated', 'informs', 'sampled', 'debacle', 'cornell', 'unheard', 'hedging', 'precise', 'neutron', 'feature', 'spelled', 'cropped', 'sponges', 'herders', 'langley', 'forcing', 'airbags', 'berserk', 'silence', 'steeple', 'slicing', 'galleon', 'mangers', 'decoder', 'caution', 'waiters', 'jaspers', 'heftier', 'widener', 'infidel'],

   ['bellevue', 'pathways', 'comedian', 'attached', 'pollutes', 'numerous', 'shepherd', 'enticing', 'purplish', 'zucchini', 'swooning', 'patching', 'envelops', 'steadily', 'abhorred', 'resulted', 'provides', 'opossums', 'postmark', 'blinding', 'defences', 'laserjet', 'coatings', 'attitude', 'outshone', 'haircuts', 'druthers', 'produces', 'treasury', 'stagnate', 'matthias', 'workaday', 'ammonium', 'mismatch', 'attacker', 'prancing', 'skeleton', 'exploits', 'alastair', 'prophets', 'upstairs', 'ironical', 'prentice', 'disabuse', 'bustling', 'assessed', 'expanses', 'hunkered', 'venomous', 'salesmen', 'clouding', 'wiggling', 'cosmetic', 'ambiance', 'dortmund', 'starving', 'furnaces', 'charting', 'semantic', 'nestling', 'emissary', 'telegram', 'banality', 'voltages', 'wrappers', 'freeways', 'distaste'],

   ['mushrooms', 'scrapping', 'roughness', 'awfulness', 'densities', 'defaulted', 'facsimile', 'majordomo', 'escapades', 'exporting', 'pratfalls', 'flattened', 'resultant', 'theorists', 'cataloged', 'fireproof', 'enigmatic', 'doctrinal', 'broadband', 'humdinger', 'declining', 'parasitic', 'londoners', 'aftermath', 'firestorm', 'equivocal', 'exporters', 'untainted', 'yachtsman', 'moonshine', 'adjusting', 'untrained', 'innermost', 'conjuring', 'constrict', 'severally', 'ineptness', 'continued', 'employing', 'execution', 'megaphone', 'engulfing', 'dramatist', 'reforming', 'expresses', 'restricts', 'frostbite', 'ignorance', 'dominates', 'resigning', 'intensely', 'voracious', 'recourses', 'trademark', 'complexes', 'misbehave', 'schedules', 'crouching', 'dissected', 'envisaged', 'lobbyists', 'diagnosed', 'shivering', 'cheekbone', 'therapies'],

      ['proprietor', 'renovating', 'concocting', 'humanizing', 'symbolizes', 'lamentable', 'overvalued', 'negativity', 'rectifying', 'unobserved', 'redemption', 'conversion', 'permission', 'worshipers', 'deliverers', 'bureaucrat', 'herbaceous', 'fourteenth', 'department', 'militarism', 'invincible', 'geometries', 'millimeter', 'italicized', 'chancellor', 'congestion', 'intermodal', 'warranting', 'initiators', 'triggering', 'similarity', 'perennials', 'unreleased', 'employment', 'unburdened', 'appointees', 'misbehaved', 'directives', 'obstetrics', 'bridesmaid', 'compromise', 'ubiquitous', 'alligators', 'dislocated', 'effortless', 'partnering', 'evacuating', 'dressmaker'],

      ['ferociously', 'projectiles', 'excavations', 'megalomania', 'communities', 'paternalism', 'lawlessness', 'scorekeeper', 'morningstar', 'contractors', 'dissipating', 'manipulator', 'imperatives', 'proportions', 'yellowknife', 'sightseeing', 'reallocated', 'scientology', 'headhunters', 'quadrupling', 'dilapidated', 'moneymaking', 'equivalents', 'infuriating', 'peripatetic', 'replenished', 'shareholder', 'prefectures', 'provocation', 'meditations', 'arraignment', 'handwritten', 'illiquidity', 'beneficiary', 'extremities', 'materialism'],

      ['decentralize', 'translations', 'psychiatrist', 'occupational', 'memorialized', 'undetectable', 'commandeered', 'significance', 'necessitates', 'otherworldly', 'decisiveness', 'skyrocketing', 'storytelling', 'interlocking', 'transforming', 'inexplicable', 'mobilization', 'geochemistry', 'unsupervised', 'incineration', 'universality', 'atmospherics', 'disintegrate', 'horrifically'],

   ['disseminating', 'fingerprinted', 'dismemberment', 'uncooperative', 'adventuresome', 'paraphernalia', 'extermination', 'notifications', 'recalculating'],

   ['countermeasure', 'unsurprisingly', 'outrageousness'],
   ['inconsistencies', 'nonprofessional'],];
    len = Math.min(len,x.length);
    // console.log(len);
    let list = x[len];
    let ind = Math.min(random(list.length),list.length-1);
    let word = list[ind];
    if(!word)
        word = x[2][2];
    return word.toUpperCase();
}
