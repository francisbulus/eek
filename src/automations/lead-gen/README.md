# Lead Generation using HunterIO and RocketReach

The following process builder, generates leads for a list of companies provided as input. The process sends request to HunterIO to get proffesional emails and then RocketReach to get roles using an end point hosted on [vercel](https://pb-lead-gen.vercel.app).

Input
```
[
    {
        "company_name": "Invisible",
        "roles": "marketing",
        "domain_name": "invisible.email"
    },{
        "company_name": "Stripe",
        "roles": "marketing",
        "domain_name": "stripe.com",
        "location": "New York"
    }
]
```

Output
```
[
    {
        "name": "Phoebe Ben-Kalio",
        "email": null,
        "title": "Bilingual Agent",
        "company": "Invisible Technologies, Inc."
    },{
        "name": "Hayley Darden",
        "email": "hayley@invisible.email",
        "title": "Brand, Content, and Marketing at Invisible Technologies",
        "company": "Invisible Technologies, Inc."
    }
]
```