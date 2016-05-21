title Misskey Launcher
rem 1 Web, API, File のリポジトリがあるディレクトリのパス

rem Redis起動
cd C:\Program Files\Redis
start .\redis-server --maxheap 2gb

rem MongoDB起動
cd C:\Program Files\MongoDB\Server\3.0\bin
start .\mongod

rem 上のやつらが起動するまで待つ
timeout /t 3 /nobreak

rem API起動
cd %1\Misskey-API
start npm start

rem File起動
cd %1\Misskey-File
start npm start

rem Web起動
cd %1\Misskey-Web
start npm start

rem 上のやつらが起動するまで待つ
timeout /t 5 /nobreak

rem ブラウザでアクセス
start http://misskey.local

exit
