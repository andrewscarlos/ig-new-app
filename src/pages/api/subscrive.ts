import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { stripe } from "../../services/stripe";
import { query } from "faunadb";
import { fauna } from "../../services/fauna";

type User = {
  ref: {
    id: string;
  };
  data: {
    stripe_customer_id: string;
  };
};
export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method not allowed");
  }

  const session = await getSession({ req });

  const user = await fauna.query<User>(
    query.Get(
      query.Match(
        query.Index("user_by_email"),
        query.Casefold(session.user.email)
      )
    )
  );

  let custimerId = user.data.stripe_customer_id;

  if (!custimerId) {
    
    const stripeCustumer = await stripe.customers.create({
      email: session.user.email,
    });
    

    await fauna.query(
      query.Update(query.Ref(query.Collection("users"), user.ref.id), {
        data: {
          stripe_customer_id: stripeCustumer.id,
        },
      })
    );
    
    custimerId = stripeCustumer.id;
  }

  const stripeCheckoutSession = await stripe.checkout.sessions.create({
    customer: custimerId,
    payment_method_types: ["card"],
    billing_address_collection: "required",
    line_items: [{ price: "price_1Ki0NrB7VA7PNoGLBoaXPJMf", quantity: 1 }],
    mode: "subscription",
    allow_promotion_codes: true,
    success_url: "http://localhost:3000/posts",
    cancel_url: "http://localhost:3000/",
  });

  return res.status(200).json({ sessionId: stripeCheckoutSession.id });
};
