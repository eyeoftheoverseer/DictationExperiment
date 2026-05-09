async function Dictate(){
    var baseText=document.getElementById("textContent").value.replaceAll("\n",", ")
    //console.log(baseText)
    var wordList=baseText.split(" ") //input is split into individual words

    // segments [0].length, [0].words [0].utterance, [0].delay
    var segments=[]
    var delay=60000/document.getElementById("targetWPM").value
    var timea=0//used for calibrating
    var timeb=0
    var timeStart=Date.now()
    var n=-1
    var rate=500/delay

        //TODO
        // FOR TUNING: average speaking ms per word appears to be 500 ish
        //      Use this to set utterance.rate when I'm more awake

    const endChars=['.','!','?',',','\n']

    // re-merge into segments
    var newSegment=true
    for(let i=0;i<wordList.length;i++){
        // i is the current word from the original list, n is the current segment
        if(newSegment){//n only increments if starting a new segment
            newSegment=false
            n++
            segments[n]={}
            segments[n].words=wordList[i]
            segments[n].length=1
        }else{//else it just adds the word and checks if it has endChars
            segments[n].words+=(" "+wordList[i])
            segments[n].length++

            newSegment=endChars.some(c=>wordList[i].includes(c))
            //TODO check if there is a more performant way to run above check
                // ??-take input string as whole, for each:
                    // check char, append to current segment, if endchar new segment.
                        //check against double end char > "d'.\s'S" and the like
        }
    }

    for(let n=0;n<segments.length;n++){// add utterances to each segment
            segments[n].delay=delay*segments[n].length// calculate delay to start segment
            segments[n].utterance=new SpeechSynthesisUtterance(segments[n].words)
            segments[n].utterance.rate=rate
    }
    
    //debug log for timing
    console.log("list "+segments.map(s=>s.words))
    console.log("target delay per word "+delay)
    console.log("rate: "+rate)

    timea=Date.now()
    for(let i=0;i<segments.length;i++){
        // the speach synthesiser runs on a seperate thread
        //      so we can call it and immedeatly continue with logic
        speechSynthesis.speak(segments[i].utterance)
        
        //wait at least as long as required for WPM
        await sleep(segments[i].delay)
        //Additionally wait until the current segment is done (tune value if needed)
        while(speechSynthesis.speaking){
            await sleep(10)
        }

        //Gets current time point
        timeb=Date.now()
        // this should (If my late night coding is accurate) show roughly any extra delays
        console.log("\n"+segments[i].words+"\nSgmnt Delay: "+(timeb-timea)) // LOG time since last time point
        console.log("per word:"+((timeb-timea)/segments[i].length))
        timea=timeb
    }
    //waits until the everything has been spoken
    while(speechSynthesis.speaking){
        await sleep(100)
    }
    timeb=Date.now()-timea //becomes time since loop ended
    timea=Date.now()-timeStart //becomes total time
    // TODO fix this
    //console.log("spillover")
    //console.log(timeb)
    console.log("total time")
    console.log(timea)
    
    console.log("target time")
    console.log(delay*wordList.length)
    console.log("real DelayPerWord")
    console.log(timea/wordList.length)
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}