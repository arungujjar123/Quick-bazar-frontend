Complete Ai Structure      
                         USER
                           │
                           ▼
                    React Frontend
                           │
                           ▼
                   Node/Express API
                           │
             ┌─────────────┴─────────────┐
             │                           │
             ▼                           ▼
        MongoDB Atlas                AI Layer
             │                           │
             │                    ┌──────┴──────┐
             │                    │             │
             ▼                    ▼             ▼
       Product Data          Pinecone        Groq
       Order Data            Vector DB       Llama
       User Data                 │             │
                                │             │
                         Retrieval/RAG ───────┘
                                              │
                                      Tool Calling
                                              │
                                     ┌────────┼────────┐
                                     ▼        ▼        ▼
                                   Cart    Orders   Compare

"We use MongoDB Atlas as the primary database and Pinecone as the vector database. Product and support-document text is converted into embeddings using multilingual-e5-large through Pinecone's inference API and batch-upserted into the quickbazaar index. During a user query, relevant context is retrieved from Pinecone and passed to the Llama 3.3 70B model through Groq for RAG-based responses. The LLM can also use tools for operations such as cart management, order-status checking, and product comparison."

==============================================================================
Hum kyun isme RAG lagaya hai instead hum simply Mongodb search  ka use kar sakte the -==========
=========
mujhe ye  bata sakte ho like isme rag ki jarurat kyun hai like iska bina direct searching se nahi kar skte hai kya kaam bas abtana hai kuch bhi karna mat 
Bina RAG ke Direct Search (jaise MongoDB Keyword Search ya Regex) se kaam zaroor ho sakta hai, par AI Assistant / Chatbot ki jagah woh bas ek normal Search Bar bankar reh jayega.

Chaliye ise aasan language me samajhte hain ki RAG (Retrieval-Augmented Generation) ki zaroorat iss project me kyun hai aur Direct Search se yeh kaise alag hai:

1. Semantic Understanding (Intent vs Exact Keyword)
Direct Search (Keyword/Regex): Exact word match par kaam karta hai.
Example: Agar user search kare "chilly winter wear", aur product me "sweater" ya "jacket" likha hai par "winter" word missing hai, toh direct search zero results dega.
RAG (Vector Search): Meaning (bhav/intent) samajhta hai.
"Kuch meetha khana hai" 
→
→ RAG samajhta hai ki Chocolates, Sweets, ya Ice Cream ki baat ho rahi hai.
"Gala kharab hai" 
→
→ RAG cough drops, honey, ya warm tea wale products retrieve kar leta hai.
2. Hallucination Ko Rokna (Factual AI Answers)
Groq Llama-3.3-70B ek bahut powerful LLM hai, lekin usko aapke QuickBazaar database ke live products, stock, prices, aur shop locations ka pehle se koi pata nahi hota.

Bina RAG ke (Direct LLM Query):
User: "QuickBazaar par Amul Milk ka price kya hai?"
LLM guess karke (hallucinate karke) galat price bataye ga (jaise ₹60).
RAG ke Saath:
Pehle Vector Search DB se real-time Amul Milk ki details (Price: ₹32, Stock: 15, Shop: City Dairy) nikalta hai.
Ye real data LLM ko Prompt Context me milta hai (
support.js
).
LLM accurate aur sachha answer deta hai: "City Dairy par Amul Milk ₹32 me available hai aur 15 packets stock me hain."
3. Natural Conversational Experience (Smart Recommendations)
Direct search se aapko sirf JSON Data / Array of Products milta hai.
RAG + Groq LLM se user ko ek human assistant jaisa experience milta hai jo:
Do products ko compare kar sakta hai ("Kaunsa toned milk health ke liye behtar hai?").
Delivery rules aur store locations samjha sakta hai.
Cart me add karne ya order trace karne me help karta hai.

======================================================
