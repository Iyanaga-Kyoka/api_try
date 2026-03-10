# !/bin/bash

# 1. アカウントの作成
# ステータス 200 と共に Account successfully created が返ってくること。
curl -X POST http://localhost:3000/signup \
     -H "Content-Type: application/json" \
     -d '{"user_id": "TaroYamada", "password": "PaSSwd4TY"}'

#2. アカウント情報の取得(Basic認証)
# User details by user_id と、初期状態の nickname（user_idと同じ）が返ってくること。
curl -X GET http://localhost:3000/users/TaroYamada \
     -u TaroYamada:PaSSwd4TY

#3. アカウント情報の更新(PATCH /users/{user_id})
# 更新後のデータが返ってくること。
curl -X PATCH http://localhost:3000/users/TaroYamada \
     -u TaroYamada:PaSSwd4TY \
     -H "Content-Type: application/json" \
     -d '{"nickname": "たろー", "comment": "僕は元気です"}'

#4. バリデーションのテスト (失敗ケース)
# 短いパスワードを送って、エラーが出るか確認。
# ステータス400とともにInput length is incorrect が返ってくること。
curl -X POST http://localhost:3000/signup \
     -H "Content-Type: application/json" \
     -d '{"user_id": "Short", "password": "123"}'