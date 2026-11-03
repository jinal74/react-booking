
import React, { useState } from 'react';
import Topbar from '../../pages/common/Topbar';
import Landing from '../../pages/common/Landing';
import {
    Accordion,
    AccordionBody,
    AccordionHeader,
    AccordionItem,
} from 'reactstrap';

export default function FAQ() {
    const [open, setOpen] = useState('');
    const toggle = (id) => {
        if (open === id) {
            setOpen('');
        } else {
            setOpen(id);
        }
    };
    return (
        <div className="meals-by-unit-main">
            <Topbar />
            <Landing>
                <div className="page-content-wrapper" id='main_faq'>
                    <div className="container-fluid">
                        <div className="container-user">

                            <div className="">
                                <div className="marginTop marginBottom">
                                    <h2 className="separator_title text-left font-size-32 ps-3"> Frequently Asked Questions </h2>
                                </div>
                            </div>

                            <Accordion flush open={open} toggle={toggle}>

                                <AccordionItem>
                                    <AccordionHeader targetId="1"><p className='mb-0'>Why are TTP Lifestyle Meals only available on Sunday and Wednesday?</p></AccordionHeader>
                                    <AccordionBody accordionId="1">
                                        <p>In order to make sure you're always getting the food freshly cook we divided up our cooking this way.
                                            That way if you're eating TTP LIfestyle meals 7 days a week you food is never older than 4 days from being cooked.</p>
                                    </AccordionBody>
                                </AccordionItem>

                                <AccordionItem>
                                    <AccordionHeader targetId="2"><p className='mb-0'>When can I pick up my TTP Lifestyle Meal?</p></AccordionHeader>
                                    <AccordionBody accordionId="2">
                                        <p>Your TTP Lifestyle Meal will be in our refrigerator at TTP Fitness between 4-5PM on Sundays and Wednesdays</p>
                                    </AccordionBody>
                                </AccordionItem>

                                <AccordionItem>
                                    <AccordionHeader targetId="3"><p className='mb-0'>What if I want different Macros?</p></AccordionHeader>
                                    <AccordionBody accordionId="3">
                                        <p>We expect to release a custom macro option before the end of the year</p>
                                    </AccordionBody>
                                </AccordionItem>

                                <AccordionItem>
                                    <AccordionHeader targetId="4"><p className='mb-0'>I live Downtown and have a secure building...how can I give the delivery driver access?</p></AccordionHeader>
                                    <AccordionBody accordionId="4">
                                        <p>We can have the driver text you, just add it to the notes on your order</p>
                                    </AccordionBody>
                                </AccordionItem>

                                <AccordionItem>
                                    <AccordionHeader targetId="5"><p className='mb-0'>How do I cancel my subscription?</p></AccordionHeader>
                                    <AccordionBody accordionId="5">
                                        <p>Cancel anytime! No penalty or hard feelings. You can cancel your subscription from your account dashboard https://lifestylemeals.ttpfitness.com/profile under "MY SUBSCRIPTION" in the left panel, then the RED button labeled "CANCEL SUBSCRIPTION". We try to make it easy with no internet gymnastics required. You can sign up again by reordering a subscription the way you did the first time or on your profile under "MY SUBSCRIPTION". Make sure to cancel before the countdown at the top of the page timer ends if you don’t want your meals to be processed for the next cook day. Have questions? info@ttpfitness.com</p>
                                    </AccordionBody>
                                </AccordionItem>

                                <AccordionItem>
                                    <AccordionHeader targetId="6"><p className='mb-0'>How do I skip the next cook day for meals?</p></AccordionHeader>
                                    <AccordionBody accordionId="6">
                                        <p>Skipping a meal order is as easy as....well skipping. Go to your account dashboard https://lifestylemeals.ttpfitness.com/profile under "MY SUBSCRIPTION" in the left panel, then under "Subscriptions Settings" in the main area look for the YELLOW button labeled "SKIP" under "Skip a Delivery". BOOM, that easy. We try to make it easy with no internet gymnastics required.</p>
                                    </AccordionBody>
                                </AccordionItem>

                                <AccordionItem>
                                    <AccordionHeader targetId="7"><p className='mb-0'>Can I pick up my meals instead of having them delivered?</p></AccordionHeader>
                                    <AccordionBody accordionId="7">
                                        <p>You can pick up your meals on Wednesdays after 4pm, at TTP Fitness, 14199 SW Millikan Rd, Beaverton Or, 97005. If your a TTP Fitness member you can use your access fob anytime! Your meals will be in a bag with your name and kept in the refrigerator behind the check-in desk.</p>
                                    </AccordionBody>
                                </AccordionItem>

                                <AccordionItem>
                                    <AccordionHeader targetId="8"><p className='mb-0'>What do I do with the cloth insulated bags and Ice?</p></AccordionHeader>
                                    <AccordionBody accordionId="8">
                                        <p>They are re-usable. Place them out on your next delivery day to avoid another bag deopsit.</p>
                                    </AccordionBody>
                                </AccordionItem>

                                <AccordionItem>
                                    <AccordionHeader targetId="9"><p className='mb-0'>Can I plan to have my meals arrive on different days?</p></AccordionHeader>
                                    <AccordionBody accordionId="9">
                                        <p>To make sure you get hte freshest food we cook twice a week; Sunday and Wednesday, and deliver on those days only.</p>
                                    </AccordionBody>
                                </AccordionItem>

                                <AccordionItem>
                                    <AccordionHeader targetId="10"><p className='mb-0'>Do you use any preservatives?</p></AccordionHeader>
                                    <AccordionBody accordionId="10">
                                        <p>No, all of our food is cooked fresh to order. We receive shipments of fresh ingredients on a daily basis.</p>
                                    </AccordionBody>
                                </AccordionItem>

                                <AccordionItem>
                                    <AccordionHeader targetId="11"><p className='mb-0'>What’s the shelf life for meals?</p></AccordionHeader>
                                    <AccordionBody accordionId="11">
                                        <p>Meals are to be kept refrigerated to maintain freshness for up to 5 days following delivery. There will be a date on the package label in case you have more than one delivery day in your refrigerator.</p>
                                    </AccordionBody>
                                </AccordionItem>

                                <AccordionItem>
                                    <AccordionHeader targetId="12"><p className='mb-0'>How do I get notified about delivery?</p></AccordionHeader>
                                    <AccordionBody accordionId="12">
                                        <p>You will get a text on Sunday and Wednesday with an estimated window of delivery. Our drivers will first knock on your door. If no one answers, they will leave the meals at your doorstep.</p>
                                    </AccordionBody>
                                </AccordionItem>

                                <AccordionItem>
                                    <AccordionHeader targetId="13"><p className='mb-0'>When will my delivery arrive?</p></AccordionHeader>
                                    <AccordionBody accordionId="13">
                                        <p>Deliveries are made every Sunday & Wednesday between 4pm-9pm. Be sure to e-mail us for any unusual circumstances and we will try to accommodate!</p>
                                    </AccordionBody>
                                </AccordionItem>

                                <AccordionItem>
                                    <AccordionHeader targetId="14"><p className='mb-0'>Where do you deliver?</p></AccordionHeader>
                                    <AccordionBody accordionId="14">
                                        <p>Portland Oregon - West of I-205 all the way to Forest Grove. South of the Columbia River all the way to Charbonneau. If you have any doubts just plug in your zip code at check out.</p>
                                    </AccordionBody>
                                </AccordionItem>

                                <AccordionItem>
                                    <AccordionHeader targetId="15"><p className='mb-0'>What is the cost for delivery?</p></AccordionHeader>
                                    <AccordionBody accordionId="15">
                                        <p>We have a flat rate of $20 for delivery and a one-time $15 bag deposit.</p>
                                    </AccordionBody>
                                </AccordionItem>

                                <AccordionItem>
                                    <AccordionHeader targetId="16"><p className='mb-0'>What happens if I forget to select meals for my next subscription order?</p></AccordionHeader>
                                    <AccordionBody accordionId="16">
                                        <p>We got you, you need to eat. You will still get food and the meals get randomly selected for you. You can also choose to have "Random Meals" from your profile under "MY SUBSCRIPTION"</p>
                                    </AccordionBody>
                                </AccordionItem>

                                <AccordionItem>
                                    <AccordionHeader targetId="17"><p className='mb-0'>Choosing Meals twice a week seems like a lot of work, is there another option?</p></AccordionHeader>
                                    <AccordionBody accordionId="17">
                                        <p>If you're the set and forget type, we have a solution for you. You will still get food and the meals get randomly selected for you. You can also choose to have "Random Meals" from your profile under "MY SUBSCRIPTION"</p>
                                    </AccordionBody>
                                </AccordionItem>

                                <AccordionItem>
                                    <AccordionHeader targetId="18"><p className='mb-0'>Why is the Delivery $20 for a À La Carte or Meal Packs, but $40 for a Subscription?</p></AccordionHeader>
                                    <AccordionBody accordionId="18">
                                        <p>We charge $20 for delivery. An À La Carte or Meal Pack orders are a one-time delivery. With a subscription we deliver twice a week; Sunday and Wednesday in order to always bring you the freshest food.</p>
                                    </AccordionBody>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    </div>
                </div>
            </Landing>
        </div>
    )
}
