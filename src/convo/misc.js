import Convo from "./Convo.js"

export const ARINDOL = new Convo("The wielder of Azan approaches as foretold by the Illumis. Make thyself at home, stranger!")
    .answer("Who are you? Do you live alone on this island?",
        new Convo("My name is Arindol. I live here in peaceful seclusion to study the teachings of the ancient world... " +
            "The Illumnis for example.")
            .answer("Tell me about this Illumnis", "R_ILLUMIS_STUDY")
            .answer("Can you get me off this planet?",
                new Convo("I believe that thee arrived from another world. Thus the Illumis spake. " +
                    "But returning thee to thy home is beyond my powers.")
                    .answer("What is the Illumis?", "R_ILLUMIS_STUDY")
                    .answer("Rats. Ok, I'll find my own way home, thanks.")
            )
            .answer("Illumni... whatever.")
    )
    .answer("What is Azan?",
        new Convo("More like who than what... Why, thou carries Azan on thy arm. " +
            "She may appear as a weapon from another world, but she is much more than that...", "R_AZAN")
            .answer("Ah, you mean the disruptor? I didn't know it was a 'she'...",
                new Convo("Know thou that wielding Azan is a great honor, for she chooses her partner. " +
                    "Azan and thou will grow and learn together.", "R_AZAN_WORKS")
                    .answer("Uh-huh. Well, I must be going...")
                    .answer("And what sort of things will we learn?",
                        new Convo("Azan is a broken aspect of the Illumis. " +
                            "When she is complete again, she will be more powerful and perhaps aid thee in thy quest.")
                            .answer("What is the Illumis?", "R_ILLUMIS_STUDY")
                            .answer("How can I make her whole again?",
                                new Convo("Seek thee out the lost fragments of Mirtul. Long ago, the mage Mirtul " +
                                    "crafted smaller aspects of the Illumis. Alas, none now know their location.", "R_AZAN_FIX")
                                    .answer("Where should I start the search for the fragments?",
                                        new Convo("Thou should investigate the lightless reaches of Arkona. " +
                                            "I believe they have passed from human hands and are now lost to the depths.", "R_WHERE_FRAGMENT")
                                            .answer("Thanks for the info")
                                            .answer("What do the fragments look like?", "R_FRAGMENT_SHAPE")
                                            .answer("How did the fragments get lost?", "R_FRAGMENT_LOST")
                                    )
                                    .answer("What do the fragments look like?",
                                        new Convo("No one has seen a fragment of Mirtul in many an age. Rumors say they appear as large precious stones.", "R_FRAGMENT_SHAPE")
                                            .answer("How did the fragments get lost?", "R_FRAGMENT_LOST")
                                            .answer("Where should I start the search?", "R_WHERE_FRAGMENT")
                                            .answer("Once I have the fragments, then what?",
                                                new Convo("I do not know the answer. Old tomes speculate that Azan will somehow gain new powers, but no details are given about how this will work...")
                                                    .answer("Well, thanks anyway.")
                                            )
                                    )
                                    .answer("How did the fragments become lost?",
                                        new Convo("War and greed of the five cities caused the fragments to change hands often. " +
                                            "Where they're now, no one knows.", "R_FRAGMENT_LOST")
                                            .answer("Where should I start the search?", "R_WHERE_FRAGMENT")
                                            .answer("What do the fragments look like?", "R_FRAGMENT_SHAPE")
                                            .answer("What are the five cities?",
                                                new Convo("Thou truly art from another world if thou have not heard of the " +
                                                    "five trading cities that rule Arkona.")
                                                    .answer("Ah yes, I know LOTS about those.")
                                                    .answer("Tell me again about fixing Azan", "R_AZAN_FIX")
                                            )
                                    )
                            )
                    )
            )
            .answer("How is 'she' more than a weapon?", "R_AZAN_WORKS")
    )
    .answer("Tell me of the Illumis?",
        new Convo("The Illumis is an invisible realm of energy, accessible only to a learned few. " +
            "In ancient times Arkonan mages used its power to shape their destiny.", "R_ILLUMIS_STUDY")
            .answer("Interesting. Are you able to produce such magic?",
                new Convo("Nay, I am but a seer. During my mediations, the Illumis revealed thy arrival with Azan, but that is all I know.")
                    .answer("Tell me about this 'Azan' thing...", "R_AZAN")
                    .answer("Goodbye Seer.")
            )
            .answer("How did you know I would come here?",
                new Convo("Thy arrival was foretold to me while I meditated on the energies of the Illumis. And here thou art!")
                    .answer("Eeenteresting. I must go now.")
                    .answer("What is the Illumis?", "R_ILLUMIS_STUDY")
                    .answer("Tell me what the Azan is", "R_AZAN")
            )
            .answer("And what is Azan?", "R_AZAN")
    )


    // .answerIf((arkona) => arkona.gameState["urhaw_notes"] == true, "Did you say Illumis? Tell me more about it!",
    //     new Convo("Dost thou know of the nature of the Illumnis? Or art thou only interested in using the Azan?")
    //         .answer("Tell me of the Illumis.")
    //         .answer("I know of it. Show me how to use the Azan.")
    // )


