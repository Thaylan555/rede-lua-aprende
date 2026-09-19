# Rede Lua v9.1 — Lunar Playground

Esta versão corrige a quebra de largura observada no mobile e reconstrói o LuaID/Avatar Studio como uma experiência muito mais visual.

## Frontend
- novo sistema visual final em `v91.css`, importado depois das folhas legadas para evitar conflitos de cascata;
- correção de largura do workspace, páginas e LuaID em telas pequenas;
- Home, navegação, HUD, cards de aprendizagem, Studio, Recordes e superfícies antigas recebem material visual novo;
- LuaID 2.0 com palco grande, cartão ao vivo, editor por abas, carrosséis e inventário;
- mobile deixa de ser desktop espremido: editor, palco, tabs e listas possuem layouts próprios.

## Avatar Revolution 2
- LuaMates redesenhados em SVG com corpo, roupa, olhos, brilho, sombras, expressões e marcas faciais;
- 16 espécies: urso, raposa, pinguim, capivara, coruja, dragão, robô, gato, axolote, coelho, macaco, yeti, panda, sapo, lontra e guaxinim;
- opções novas de olhos e marcas faciais;
- kits prontos enriquecidos e novos looks;
- botão Surpreenda-me agora mistura espécie, expressão, olhos, marcas, roupa, companheiro e efeitos.

## Compatibilidade
Nenhuma tabela nova é necessária para o editor visual; o `avatar_config` continua sendo JSON. A versão preserva LuaID, Recordes, Nova Vida e inventário existentes.
