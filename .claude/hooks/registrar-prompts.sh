#!/usr/bin/env bash
# Registra en prompts.md (raíz del proyecto) cada prompt del usuario y cada respuesta de Claude.
#   registrar-prompts.sh prompt     -> hook UserPromptSubmit
#   registrar-prompts.sh respuesta  -> hook Stop
# Solo añade al final del fichero; nunca borra lo que ya hay. Nunca bloquea: sale siempre con 0.

modo="$1"
entrada="$(cat)"
raiz="${CLAUDE_PROJECT_DIR:-$(pwd)}"
destino="$raiz/prompts.md"

campo() { jq -r "$1 // empty" <<<"$entrada" 2>/dev/null; }

sesion="$(campo '.session_id')"
transcript="$(campo '.transcript_path')"
touch "$destino"

# Número del último prompt registrado (0 si no hay ninguno).
ultimo_prompt() {
  grep -oE '^## Prompt # [0-9]+' "$destino" | tail -1 | grep -oE '[0-9]+$' || echo 0
}

# Modelo: el que trae el evento, o el del último mensaje del asistente en el transcript.
modelo() {
  local m
  m="$(campo '.model.id // .model')"
  if [ -z "$m" ] && [ -f "$transcript" ]; then
    m="$(grep '"type":"assistant"' "$transcript" | tail -1 | jq -r '.message.model // empty' 2>/dev/null)"
  fi
  echo "${m:-desconocido}"
}

# Esfuerzo: evento > variable de entorno > settings (proyecto local, proyecto, usuario).
esfuerzo() {
  local e f
  e="$(campo '.effort_level // .effort')"
  [ -z "$e" ] && e="${CLAUDE_CODE_EFFORT_LEVEL:-}"
  if [ -z "$e" ]; then
    for f in "$raiz/.claude/settings.local.json" "$raiz/.claude/settings.json" "$HOME/.claude/settings.json"; do
      [ -f "$f" ] && e="$(jq -r '.effortLevel // empty' "$f" 2>/dev/null)"
      [ -n "$e" ] && break
    done
  fi
  echo "${e:-por defecto}"
}

case "$modo" in
  prompt)
    n=$(( $(ultimo_prompt) + 1 ))
    {
      printf '\n---\n\n'
      printf '**Fecha y hora:** %s · **Herramienta:** Claude Code · **Modelo:** %s · **Esfuerzo:** %s · **Sesión:** `%s`\n\n' \
        "$(date '+%Y-%m-%d %H:%M:%S %Z')" "$(modelo)" "$(esfuerzo)" "${sesion:-desconocida}"
      printf '## Prompt # %s\n\n' "$n"
      campo '.prompt'
      printf '\n'
    } >>"$destino"
    ;;

  respuesta)
    n="$(ultimo_prompt)"
    [ "$n" -eq 0 ] && exit 0
    # Una sola respuesta por prompt aunque Stop se dispare más de una vez.
    grep -qE "^## Respuesta a Prompt # $n\$" "$destino" && exit 0

    # Todo el texto del asistente desde el último prompt real del usuario
    # (ignora tool_result y mensajes meta), en orden.
    texto=""
    if [ -f "$transcript" ]; then
      texto="$(jq -rs '
        (map(select(.type == "user" and (.isMeta | not)
                    and ((.message.content | type) == "string"
                         or (.message.content | any(.type == "text")))))
         | last) as $u
        | (index($u)) as $i
        | .[($i // -1) + 1:]
        | map(select(.type == "assistant") | .message.content[]? | select(.type == "text") | .text)
        | join("\n\n")
      ' "$transcript" 2>/dev/null)"
    fi
    [ -z "$texto" ] && texto="$(campo '.last_assistant_message')"
    [ -z "$texto" ] && texto="_(respuesta sin texto o no disponible en el transcript)_"

    {
      printf '\n## Respuesta a Prompt # %s\n\n' "$n"
      printf '%s\n' "$texto"
    } >>"$destino"
    ;;
esac

exit 0
