Reference vs Embedding — One-Line Rule

Ye interview ke liye yaad kar lo:

Frequently changing shared data → Reference

Data that belongs closely to the parent or needs a historical snapshot → Embed

Example:

Product → Shop       = Reference
Shop → Owner         = Reference
Order → User         = Reference

Order → Order Items  = Embed
Cart → Cart Items    = Embed
🎯 Final Interview Answer

Agar interviewer pooche:

"Explain your MongoDB design decisions."

Tum bol sakte ho:

"We chose MongoDB because its document model fits our JSON-based APIs and gives us flexibility for category-specific product attributes. We use references for shared entities such as User, Shop, and Product relationships, which avoids duplicating frequently changing data. For Order and Cart items, we use embedded sub-documents because they are tightly associated with the parent document. In Orders, we additionally snapshot fields such as product name and purchase price so historical order data remains correct even when the current product changes."