exports.getCreditsPage = (req,res)=>{

    res.sendFile(
        "credit.html",
        {
            root:"public"
        }
    );

};