title Misskey Launcher
rem 1 Web, API, File のリポジトリがあるディレクトリのパス

IF "%1" EQU "" (
	SET MISSKEY_PATH="C:\Users\syuilo\Desktop\projects"
) ELSE (
	SET MISSKEY_PATH=%1
)

rem ================================================================

rem Skypeはポート占有するので殺す
taskkill /im Skype.exe /F /T
timeout /t 1 /nobreak

rem Redis起動
cd "C:\Program Files\Redis"
start .\redis-server --maxheap 2gb

rem MongoDB起動
cd "C:\Program Files\MongoDB\Server\3.0\bin"
start .\mongod

rem 上のプログラムらが起動するまで待つ
timeout /t 5 /nobreak

rem API起動
cd "%MISSKEY_PATH%\Misskey-API"
start npm start

rem 起動するまで待つ
timeout /t 1 /nobreak

rem File起動
cd "%MISSKEY_PATH%\Misskey-File"
start npm start

rem 起動するまで待つ
timeout /t 1 /nobreak

rem Web起動
cd "%MISSKEY_PATH%\Misskey-Web"
start npm start

rem 起動するまで待つ
timeout /t 10 /nobreak

rem ブラウザでアクセス
start http://misskey.local

exit
