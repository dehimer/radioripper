Риппинг онлайн радио на отдельные треки с названием трека и исполнителем.<br>
Умеет работать в циклическом режиме, то есть новые треки заменяют самые старые, если итоговый размер скачанного превышает указанный размер.<br>


ПРОБЛЕМЫ
1. Необходимость ставить внещний пакет https://github.com/streamripper/streamripper
2. Он запускается через spawn процесса, а это неудобства, например с обработкой ошибок

TODO

0. Понять, почему некоторые источники выкидывают streamripper в ошибку и как с этим жить
1. Настроить webpack и необходимое окружение и убедиться что оно работает
2. Представить будущую структуру компонентов


Ретроспектива кода<br>
dirsize.js - рекурсивный подсчёт размера директории<br>
face.html - открывает на проигрывание поток радиостанции ретранслирующейся по определённому адресу (это делает streamripper, если источнику указаться onair:true)<br>
multiload.js - основной скрипт<br>
oldestfiles.js - определение самых старых файлов<br>
radiostationslist.json - список радиостанций для риппинга<br>
setting.json - настройки работы приложения<br>
