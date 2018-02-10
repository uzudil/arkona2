import Convo from "./Convo"

export const ACOLYTE = new Convo("What art thou doing here down here? I will summon the guard at once!")
    .answer("I uh... just visiting? How about... you?",
        new Convo("Visiting? Hmm, thou may prove useful for the ritua... Er that is, I meant to say, ...Parade. " +
            "Yes, there will be a parade. Dost thou like parades?")
            .answer("I am showing myself out. Later creep!")
            .answer("A parade?! Wow! How do I join?",
                new Convo("A volunteer, very good. Follow the corridors and keep going north-east. To the chapel and thou will " +
                    "reach a large open space beyond. When there, be sure thou stands on one of the marks on the floor.")
                    .answer("Marks on the floor, got it. What happens next?",
                        new Convo("Thou should wait until the ritu... I mean, until the festivities start. It may take a few minutes. Stay on the mark, no " +
                            "matter what and do not move.")
                            .answer("This will be fun!")
                    )
                    .answer("Um, I changed my mind. Adios.")
            )
    )
    .answer("I was just leaving...")

export const OREN = Convo.condition((arkona) => arkona.gameState["mezalka_dead"],
    new Convo("Thou hath done a great deed. The citizens of Varholm will remember thy bravery forever.")
        .answer("It was the right thing to do."),
    new Convo("Thou hath the look of a visitor from a foreign land. How can I aid thee in thy travels?")
        .answer("You don't know the half of it... I'm from another planet",
            new Convo("Tho doth tell a good pun! There is no life in the skies? If that were true, our keepers of " +
                "knowledge would know of it. Tell me truly, why art thou here?")
                .answer("I'm sightseeing.", "R_VARHOLM")
                .answer("I' just visiting... See you later!")
                .answerIf((arkona) => arkona.gameState["kill_mezalka"] == true, "Wilda told me to find you", "R_OREN_START")
        )
        .answer("Who lives in this castle?", "R_MEZALKA")
        .answerIf((arkona) => arkona.gameState["kill_mezalka"] == true, "The woodcutter Wilda sent me...",
            new Convo("Keep thy voice down! If the nobles or the guard hear us, we're done for. How many nights I prayed " +
                "that this time would come. Dost thou know what thou must do?", "R_OREN_START")
                .answer("I will go and directly confront Mezalka",
                    new Convo("Nay, thou must not do that. Go talk to Wilda again and make sure thou knoweth thy role.")
                        .answer("I will do that. See you again soon!")
                )
                .answer("No... what should I do?",
                    new Convo("Thou must go and talk to Wilda again to learn thy part in this. Come back why thy mission is clear.")
                        .answer("I will do that. See you again soon!")
                )
                .answer("I will volunteer to be a part of the rituals in the caves",
                    new Convo("Aye that is correct. The accursed Acolytes doth chant and read from a horrid tome during the ritual. " +
                        "When it is thy turn, thou must utter the phrase 'Mezalca Exilium Lux'.", "R_PHRASE")
                        .answer("From a book you say?",
                            new Convo("According to legend, the rise of all Raighd-cults can be traced back to single treatise on Necrotic magic. Over the years " +
                                "many copies were made but I believe this one is the original.")
                                .answer("Is the book valuable?",
                                    new Convo("It might be to collectors, or other Raighd-spawn. Thou can do with it as thou likes once this is over.")
                                        .answer("Could you repeat the phrase I need to remember?", "R_PHRASE")
                                        .answer("I think I will destroy it", "R_DESTROY_BOOK")
                                    )
                                )
                                .answer("Should the book be destroyed?",
                                    new Convo("Books on magic cannot be destroyed. Thou should keep it, maybe in thy travels thou finds one capable of its desposal.", "R_DESTROY_BOOK")
                                        .answer("Could you repeat the phrase I need to remember?", "R_PHRASE")
                                        .answer("What will happen after I utter the phrase?", "R_AFTER_PHRASE")
                                )
                        )
                        .answer("What will that accomplish?",
                            new Convo("When the ritual starts I will be near Mezalka. When thou sayeth the phrase, it will disrupt the " +
                                "ritual and temporarily weaker the chief. That is the time I will kill him.", "R_AFTER_PHRASE",
                                (arkona) => arkona.gameState["start_ritual"] = true)
                                .answer("Is there not a way without bloodshed?",
                                    new Convo("Nay, this is the only way. Mezalka is deeply corrupted from decades of Raighd energy - he must be killed.")
                                        .answer("I understand. See you after this is done.")
                                )
                                .answer("Got it. I will find you afterwards.")
                        )
                )
    )

export const GUARD =
    Convo.condition((arkona) => arkona.gameState["mezalka_dead"],
        new Convo("Move along citizen.")
            .answer("Didn't mean to bother you, sorry."),
        new Convo("Shoulds't thou be here? Methinks 'haps a dungeon cell awaits thee.")
            .answer("Um, I was just leaving anyway.")
    )

export const NOBLE = new Convo("Thy uncouth smell offends me. Away from me beggar else I call for the guards!")
    .answer("What is it you do here?",
        new Convo("GUARDS! Take this pest to the dungeons...", "R_CALL_GUARDS")
            .answer("I am on my way, see you later")
    )
    .answer("Why you pompous cretin...", "R_CALL_GUARDS")

export const KING = new Convo("Ah a citizen comes before me. What is it you wish of your ruler, pawn?")
    .answer("Could you tell me where I am?", "R_VARHOLM")
    .answerIf((arkona) => arkona.gameState["info_wilda"] == true, "I know what's happening in the caves!",
        new Convo("Humor me commoner. What dost thou think is happening in the caves?", "R_CAVE_PURPOSE")
            .answer("They're home to interesting stone formations!",
                new Convo("Thou art right commoner. The caves of Varholm are indeed a natural wonder. They are a dangerous place to " +
                    "visit however, and I recommend thee to stay away, lest thou face unfortunate peril!", "R_CAVE_PERIL")
                    .answer("Thank you for the warning.")
                    .answer("I was just kidding, I know what you're up to.", "R_CAVE_PURPOSE")
            )
            .answer("They're a natural beauty of this island.", "R_CAVE_PERIL")
            .answer("Young people are sacrificed by Raighd-worshipping cult!",
                new Convo("Thou bring a serious accusation. How came thee by this knowledge? Answer me, pawn!")
                    .answer("It's what they say in town...",
                        new Convo("I see that thou will not diverge the name of the slanderer. Perhaps a visit to the dungeons will jog thy memory. GUARDS!", "",
                            (arkona) => alert("move player to dungeon: " + arkona)
                        ).answer("")
                    )
                    .answer("I was joking. The caves make for a great hike.", "R_CAVE_PERIL")
            )
    )

export const HERMIT = new Convo("The heavens burn with liquid contempt for thee! Hot eyes of fire blaze forth and vaporize thy soul intruder. " +
    "Thou wilt not take me back!")
    .answer("Ah well, look at the time... I must be going.")
    .answerIf((arkona) => arkona.gameState["info_marten"] == true, "Tell me about the disappearances, Marten.",
        new Convo("To the west lie savage swamps... Myst-shrouded, old and haunted. But those who don't " +
            "return fall not to its venomous residents, as some claim.")
            .answer("I see, so it's 'ghosts' that killed these people, right?", "R_DONT_ENTER_CAVES")
            .answer("If it's not the snakes, what then happened to these unfortunates?",
                new Convo("At the center of the swamp lies a gateway. Carved into the flesh of slab of rock. The steps lead down into darkness.")
                    .answer("Let me guess: they fell down the stairs?", "R_DONT_ENTER_CAVES")
                    .answer("What is down there? Have you been there?",
                        new Convo("Yes, once I lived down in that fetid pit of lunacy. But my days of insanity are over for I escaped! " +
                            "I will never return and live here now to serve this warning to all who would listen.")
                            .answer("What happens in the cave?",
                                new Convo("In the subterranean darkness, the Acolytes of the Raighd labor to break the hold of encircling cities. " +
                                    "They hope to summon and free the Raighd's powers here in Varholm.")
                                    .answer("What is the Raighd?")
                                    .answer("This is terrible! It must be stopped!",
                                        new Convo("And there is more. Ever wonder how our 'good' Chief Mezalka is loved by all? How he seemingly lives on and on? " +
                                            "Not only complicit is he, but a direct beneficiary of these evil powers.")
                                            .answer("This is beyond my pay-grade... I out.")
                                            .answer("How do you know this Hermit?",
                                                new Convo("If thou need more proof, talk to Wilda the Woodcutter. She can tell thee more about this grave situation. " +
                                                    "She lives to the west of the Harbor Inn.", "", (arkona) => arkona.gameState["info_wilda"] = true)
                                                    .answer("I will go and see her at once.")
                                                    .answer("Tell me again about the caves.", "R_DONT_ENTER_CAVES")
                                                    .answer("Been smoking your herb, Hermit? I don't believe any of this.")
                                            )
                                    )
                                    .answer("Uh-huh... likely story. I'm leaving.")
                            )
                    )
            )
    )
    .answer("Take me back where?",
        new Convo("I've seen the oozing magma spew forth from the wounds of God. I felt my sanity shatter like a dropped mirror at her touch. " +
            "Yet she pressed on... ever on. Down in the caves.")
            .answer("Where are these caves?",
                new Convo("Never enter the caves! Rancid, hot breath slays and corrupts. Thou shalt be unbuilt! And thy " +
                    "energies suffused and re-purposed to serve her terrible plan...", "R_DONT_ENTER_CAVES")
                    .answer("I see... if I could just...",
                        new Convo("Hot vapors ignite in scorching flame! Reality burns to ashen husk, to " +
                            "crumble as black dust. Avoid the caves! Thou must avoid the caves.")
                            .answer("How very interesting. I'm leaving now.")
                    )
            )
    )

export const WOODCUTTER = new Convo("Logs? Branches? Firewood? I got them all. If thou need felling, I'm all yours for the labor.")
    .answer("What is it you do here?",
        new Convo("Thou must have wood for a brain... Look around thee! I ply my trade as a woodcutter. Fell, clear and haul. Now if thou hath no " +
            "business for me, get thee to pester someone else at the Blue Boar.")
            .answer("The Blue Boar? What is that?", "R_BLUE_BOAR")
    )
    .answer("Could you tell me about the island?", "R_VARHOLM")
    .answerIf((arkona) => arkona.gameState["info_wilda"] == true, "Marten says you have some info for me about Chief Mezalka?",
        new Convo("Thou talked to old Marten, aye? What did he tell thee?")
            .answer("We discussed the art of ink-making.",
                new Convo("Aye that is good to know. Here is my tip for thee: avoid botherin nobility. It will land thee in the dungeons.", "R_FALSE_TIP")
                    .answer("Great tip, thanks!")
            )
            .answer("He told me of snakes in the swamp.", "R_FALSE_TIP")
            .answer("He talked about caves.",
                new Convo("Thou art correct. Old Marten is not a simple hermit, but an ex-acolyte of the Raighd. He escaped their lair " +
                    "and now works warn others of its dangers.")
                    .answer("You sound as crazy as that geezer. I'm leaving.")
                    .answer("This I know already. What more info do you have?",
                        new Convo("Thou may have also heard that our Chief Mezalka uses the fell energies created by the Acolytes. " +
                            "This is what prolongs his life and supplies his riches.")
                            .answer("And how do you know all this?",
                                new Convo("I know this, because I'm also not as I seem. I am a woodcutter now, but once was a member of Mezalka's circle of nobility. " +
                                    "As such, I also benefited and lived a life of plenty.")
                                    .answer("What happened?",
                                        new Convo("One day I accidentally saw the cost of our easy life. Hath thou heard in town of the disappearances?")
                                            .answer("Yes, people get lost in the swamp and die of snake venom...",
                                                new Convo("The swamp and snakes is a ruse. Young people are lured to the swamp so the Acolytes can sacrifice them. " +
                                                    "Their souls fuel their necromantic rituals to summon creatures of the Raighd.")
                                                    .answer("And you saw this first-hand?",
                                                        new Convo("Aye, I did, as did Marten. Thou must decide if thou will help us. Even if not, Chief Mezalka and the Acolytes must be stopped.")
                                                            .answer("I will certainly stay away from all this.", "R_NO_HERO")
                                                            .answer("I would help if I can",
                                                                new Convo("Great! Thou will find thy entry into the Castle barred. Even if thou could enter, confronting the " +
                                                                    "Chief or a Noble will only land thee in the dungeons. But there is another... a dangerous way...")
                                                                    .answer("What do you have in mind?",
                                                                        new Convo("Thou must enter the caves. Through the caves, enter the castle proper. Be sure to avoid the guards and find Advisor Oren. " +
                                                                            "He is a fast friend who believes as Marten and I.")
                                                                            .answer("Ok, and once I find him?",
                                                                                new Convo("Tell Oren that I sent thee and he will know what to do. Oren will have to kill Chief Mezalka's human shell at the " +
                                                                                    "same time thou participates in and interrupts the Acolytes' ritual.")
                                                                                    .answer("Participate in the ritual? Surely you don't mean...",
                                                                                        new Convo("Chief Mezalka has grown powerful over the centuries. He is only slightly weaker during the ritual when his human shell is " +
                                                                                            "recharged with necromantic power. This is the only time he can be killed.", "R_MEZALKA_SHELL")
                                                                                            .answer("But how do I disrupt the ritual?",
                                                                                                new Convo("Much of the ritual relies on chanting. Thou must use thy voice to unbalance in the timing so the Raighd's energies are not summoned.")
                                                                                                    .answer("Once Mezalka is dead, what happens then?",
                                                                                                        new Convo("Aye, er... I'm not sure. Only his human form will cease to be, so thou should be prepared for anything. He will be weakened at least.")
                                                                                                            .answer("I will do it! I will rid this island of his evil!",
                                                                                                                new Convo("Good luck to thee! Long have we lived under the shadow of these evil forces. Long have our youth endured this dark sorcery! " +
                                                                                                                    "May the gods aid thee in thy quest.", "",
                                                                                                                    (arkona) => arkona.gameState["kill_mezalka"] = true)
                                                                                                                    .answer("I will report back on my progress.")
                                                                                                            )
                                                                                                            .answer("I need more of a chance to live through this... no thanks.",
                                                                                                                new Convo("Aye, I understand. Not everyone has the calling of a hero.", "R_NO_HERO")
                                                                                                                    .answer("Goodbye.")
                                                                                                            )
                                                                                                    )
                                                                                            )
                                                                                    )
                                                                                    .answer("The Chief has an earthly shell?", "R_MEZALKA_SHELL")
                                                                                    .answer("Wow, no I'm getting out while I'm still alive.", "R_NO_HERO")
                                                                            )
                                                                    )
                                                                    .answer("No thanks. This is scaring me.", "R_NO_HERO")
                                                            )
                                                    )
                                            )
                                            .answer("Your story is getting stale, woodcutter. I'm leaving.")
                                    )
                            )
                            .answer("Riiight. Look, I gotta go.")
                    )
            )
    )

export const COMMON = new Convo("Welcome to Varholm island visitor.")
    .answer("Tell me about the island",
        new Convo("Woulds't thou hear of entertainment, our rulers or the island's nature?", "R_VARHOLM")
            .answer("Tell me what there is to do on the island",
                new Convo("Thou can find refreshment at the Harbor Inn or rub elbows with the locals at the Blue Boar Pub. " +
                    "We also have a small zoo with rotating fauna.")
                    .answer("Tell me of the Inn",
                        new Convo("The Harbor Inn is run by a retired ship captain at the center of the island. " +
                            "His rooms are clean and the rates reasonable.")
                            .answer("Thanks, I'll be going now")
                            .answer("Tell me again about your island", "R_VARHOLM")
                    )
                    .answer("Show me to the pub!",
                        new Convo("The pub is named after the mythical Blue Boar, the mascot of our Island. " +
                        "It's located in the center of town across from Harbor Inn.", "R_BLUE_BOAR")
                            .answer("I need a beer... see you later.")
                            .answer("Tell me again about your island", "R_VARHOLM")
                    )
                    .answer("I love zoo-s! Do they have elephants?",
                        new Convo("The local zoo is the project of the naturalist Dr Mipp. Whatever animals he happens to " +
                            "be studying are available for public observation. This time, I hear it's wolves.")
                            .answer("I'll check it out, thanks!")
                            .answer("Tell me again about your island", "R_VARHOLM")
                    )
            )
            .answer("Who is in charge here?",
                new Convo("Varholm island is under the perpetual leadership of Chief Mezalka. He is a kind and noble ruler " +
                    "and has been as far back as anyone can remember.", "R_MEZALKA")
                    .answer("So are you saying he lives forever?", new Convo("Thou art joking... and yet... I don't " +
                        "remember when his rule began. Strange!")
                        .answer("How is he a good Chief?", "R_MEZALKA_GOOD")
                        .answer("Tell me again about your island", "R_VARHOLM")
                    )
                    .answer("How is he 'good and noble'?",
                        new Convo("Varholm island has no taxes. No tributes. No conscription. Aside from the occasional " +
                            "disappearances, this is a great place to live!", "R_MEZALKA_GOOD")
                            .answer("Did you say 'disappearances'...?",
                                new Convo("Every couple of years, young people don't return from the swamps... There are rumors...", "R_DISAPPEAR")
                                    .answer("Rumors, such as...",
                                        new Convo("The west side of the island is covered in swamps. When people disappear there " +
                                            "it's usually due to snakes or gators. Of course some say otherwise...")
                                            .answer("What do they say?",
                                                new Convo("Thou should go visit crazy Marten the Hermit. Perhaps thou can make sense of his lunatic ravings. " +
                                                    "He claims he knows the true reason behind why people go missing.")
                                                    .answer("Where do I find this hermit?",
                                                        new Convo("Thou can find his hut on the north-east tip of Varholm island.", "",
                                                            (arkona) => arkona.gameState["info_marten"] = true)
                                                            .answer("Thanks I'll look him up.")
                                                    )
                                                    .answer("No thanks, but tell me more about your island.", "R_VARHOLM")
                                            )
                                    )
                            )
                    )
                    .answer("Perhaps I'll pay him a visit, thanks.")
            )
            .answer("Tell me of the island's natural wonders",
                new Convo("Thou doth stand in Varholm Village on the east side of Varholm island. The entire island is " +
                    "surrounded by mountains and is inaccessible by sea. To the west lie a maze of swamps.")
                    .answer("Tell me of the mountains",
                        new Convo("Snow covered peaks encircle our land and keep us safe from marauders. And if they do manage to break " +
                            "in, they will be met with our protector, Chief Mezalka.")
                            .answer("Who is chief Mezalka?", "R_MEZALKA")
                            .answer("Tell me again about your island", "R_VARHOLM")
                    )
                    .answer("Tell me about the swamp", new Convo("The entire west end of Varholm Island is home to an extensive swamp. Infested with snakes and gators, " +
                        "it is not a place thou should visit! People who come here, do not return.")
                        .answer("Sounds scary. See you later.")
                        .answer("How many people disappeared in the swamps?", "R_DISAPPEAR")
                        .answer("Tell me again about your island", "R_VARHOLM")
                    )
            )
    )

