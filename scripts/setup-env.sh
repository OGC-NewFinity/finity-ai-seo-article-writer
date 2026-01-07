#!/bin/bash
# Bash script to setup .env file from env.example
# Usage: ./scripts/setup-env.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_EXAMPLE="$PROJECT_ROOT/env.example"
ENV_FILE="$PROJECT_ROOT/.env"

echo "🔧 Setting up .env file..."
echo ""

# Read template
if [ ! -f "$ENV_EXAMPLE" ]; then
    echo "❌ Error: $ENV_EXAMPLE not found!"
    exit 1
fi

# Read existing .env if it exists
declare -A existing_env
if [ -f "$ENV_FILE" ]; then
    echo "📖 Reading existing .env file..."
    while IFS='=' read -r key value || [ -n "$key" ]; do
        # Skip empty lines and comments
        [[ -z "$key" || "$key" =~ ^# ]] && continue
        
        # Remove quotes from value
        value="${value#\"}"
        value="${value%\"}"
        value="${value#\'}"
        value="${value%\'}"
        
        existing_env["$key"]="$value"
    done < <(grep -v '^#' "$ENV_FILE" | grep -v '^$' || true)
    echo "   Found ${#existing_env[@]} existing keys"
    echo ""
else
    echo "📝 Creating new .env file from template..."
    echo ""
fi

# Required keys
required_keys=(
    "DATABASE_URL"
    "SECRET"
    "USERS_VERIFICATION_TOKEN_SECRET"
    "USERS_RESET_PASSWORD_TOKEN_SECRET"
    "BACKEND_CORS_ORIGINS"
    "ADMIN_EMAIL"
    "ADMIN_PASSWORD"
    "SMTP_HOST"
    "SMTP_PORT"
    "SMTP_USERNAME"
    "SMTP_PASSWORD"
    "EMAILS_FROM_EMAIL"
    "EMAILS_ENABLED"
    "FRONTEND_URL"
    "VITE_API_URL"
)

# Process template and merge with existing
output_lines=()
declare -A used_keys

while IFS= read -r line || [ -n "$line" ]; do
    trimmed=$(echo "$line" | xargs)
    
    # Preserve empty lines and comments
    if [[ -z "$trimmed" || "$trimmed" =~ ^# ]]; then
        output_lines+=("$line")
        continue
    fi
    
    if [[ "$trimmed" =~ ^([^=:#]+)=(.*)$ ]]; then
        key="${BASH_REMATCH[1]}"
        key=$(echo "$key" | xargs)
        used_keys["$key"]=1
        
        # Use existing value if present, otherwise use template value, otherwise __REQUIRED__
        if [ -n "${existing_env[$key]}" ]; then
            value="${existing_env[$key]}"
        else
            template_value="${BASH_REMATCH[2]}"
            template_value=$(echo "$template_value" | xargs)
            template_value="${template_value#\"}"
            template_value="${template_value%\"}"
            template_value="${template_value#\'}"
            template_value="${template_value%\'}"
            
            if [[ -z "$template_value" ]]; then
                # Check if required
                if [[ " ${required_keys[@]} " =~ " ${key} " ]]; then
                    value="__REQUIRED__"
                else
                    value=""
                fi
            else
                value="$template_value"
            fi
        fi
        
        output_lines+=("$key=$value")
    fi
done < "$ENV_EXAMPLE"

# Add any additional keys from existing env that aren't in template
for key in "${!existing_env[@]}"; do
    if [ -z "${used_keys[$key]}" ]; then
        output_lines+=("$key=${existing_env[$key]}")
    fi
done

# Write merged .env file
printf '%s\n' "${output_lines[@]}" > "$ENV_FILE"
echo "" >> "$ENV_FILE"

echo "✅ .env file updated successfully!"
echo ""

# Check for missing required values
missing_required=()
while IFS='=' read -r key value || [ -n "$key" ]; do
    [[ -z "$key" || "$key" =~ ^# ]] && continue
    value="${value#\"}"
    value="${value%\"}"
    if [[ " ${required_keys[@]} " =~ " ${key} " ]]; then
        if [[ -z "$value" || "$value" == "__REQUIRED__" ]]; then
            missing_required+=("$key")
        fi
    fi
done < "$ENV_FILE"

if [ ${#missing_required[@]} -gt 0 ]; then
    echo "⚠️  The following required keys need to be set:"
    for key in "${missing_required[@]}"; do
        echo "   - $key"
    done
    echo ""
    echo "📝 Please edit .env and replace __REQUIRED__ with actual values."
    echo ""
else
    echo "✅ All required keys have values set!"
    echo ""
fi