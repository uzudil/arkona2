import Convo from "./Convo.js"
// import * as ConvoUtils from "./ConvoUtils"

export const COMMON = new Convo("Thou art welcome to Haaga, the jewel of the north deserts of Arkona!")
    .answer("Tell me about your town")

export const MAYOR = new Convo("What brings thee to Haaga? We don't often get visitors here.")
    .answer("Tell me about your town")

export const SEER = new Convo("A visitor comes to the house of Drem in Haaga. Tell me of thy journey stranger... What art thou after?")
    .answer("I want to return to my home planet",
        new Convo("I have always suspected life exists not only on Arkona. I have not heard of a method " +
            "to leave this planet but perhaps the answer lies within the Raighd.")
            .answer("The Raighd? What is that?", "R_COMMON_RAIGHD")
            .answer("I thought the Raighd was a chaotic forest. How could it help me go home?",
                new Convo("In my years of research I have come across a few mysteries which all seem to lead to the Raighd. " +
                    "I believe its powers originate from outside Arkona. And that might be thy way off this planet.")
                    .answer("")
            )
    )
    .answer("What can you tell me about Arkona", "R_COMMON_ARKONA")