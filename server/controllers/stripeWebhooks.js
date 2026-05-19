import Stripe from 'stripe';
import Booking from '../models/Booking.js';

//API to handle stripe webhooks

export const stripeWebhooks = async (req, res) => {
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
    } catch (err) {
        console.log('Webhook signature verification failed.', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    //handle the event
    if(event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object;
        const paymentIntentId = paymentIntent.id;

        //getting session id from metadata
        const session = await stripeInstance.checkout.sessions.list({
            payment_intent: paymentIntentId,
        });
        const {bookingId} = session.data[0].metadata;
        //marking the booking as paid
        await Booking.findByIdAndUpdate(bookingId, { isPaid: true , paymentIntentId: "Stripe"});
    } else {
        console.log(`Unhandled event type ${event.type}`);

    }

    res.json({ received: true });
}