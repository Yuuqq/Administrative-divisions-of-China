#!/usr/bin/env bash

sqlite3 ./dist/data.sqlite "SELECT code,name FROM province ORDER BY code;" | awk -F'|' '
   BEGIN { printf "[" }
   {
      if (NR > 1) printf ","
      printf "{\"code\":\"%s\",\"name\":\"%s\"}", $1, $2
   }
   END { print "]" }
' > ./dist/provinces.json

sqlite3 ./dist/data.sqlite "SELECT code,name,provinceCode FROM city ORDER BY code;" | awk -F'|' '
   BEGIN { printf "[" }
   {
      if (NR > 1) printf ","
      printf "{\"code\":\"%s\",\"name\":\"%s\",\"provinceCode\":\"%s\"}", $1, $2, $3
   }
   END { print "]" }
' > ./dist/cities.json

sqlite3 ./dist/data.sqlite "SELECT code,name,cityCode,provinceCode FROM area ORDER BY code;" | awk -F'|' '
   BEGIN { printf "[" }
   {
      if (NR > 1) printf ","
      printf "{\"code\":\"%s\",\"name\":\"%s\",\"cityCode\":\"%s\",\"provinceCode\":\"%s\"}", $1, $2, $3, $4
   }
   END { print "]" }
' > ./dist/areas.json

sqlite3 ./dist/data.sqlite "SELECT code,name,areaCode,cityCode,provinceCode FROM street ORDER BY code;" | awk -F'|' '
   BEGIN { printf "[" }
   {
      if (NR > 1) printf ","
      printf "{\"code\":\"%s\",\"name\":\"%s\",\"areaCode\":\"%s\",\"cityCode\":\"%s\",\"provinceCode\":\"%s\"}", $1, $2, $3, $4, $5
   }
   END { print "]" }
' > ./dist/streets.json

sqlite3 ./dist/data.sqlite "SELECT code,name,streetCode,areaCode,cityCode,provinceCode FROM village ORDER BY code;" | awk -F'|' '
   BEGIN { printf "[" }
   {
      if (NR > 1) printf ","
      printf "{\"code\":\"%s\",\"name\":\"%s\",\"streetCode\":\"%s\",\"areaCode\":\"%s\",\"cityCode\":\"%s\",\"provinceCode\":\"%s\"}", $1, $2, $3, $4, $5, $6
   }
   END { print "]" }
' > ./dist/villages.json
