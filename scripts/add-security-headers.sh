#!/bin/bash

# Script to add security meta tags to all HTML files
# Run from repository root: bash scripts/add-security-headers.sh

SECURITY_HEADERS='  <!-- Security Headers -->
  <meta http-equiv="X-Content-Type-Options" content="nosniff" />
  <meta http-equiv="X-Frame-Options" content="DENY" />
  <meta http-equiv="X-XSS-Protection" content="1; mode=block" />
  <meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
  <meta http-equiv="Permissions-Policy" content="geolocation=(), microphone=(), camera=(), payment=(), usb=()" />
  '

echo "Adding security headers to HTML files..."

# Find all HTML files that don't have security headers (handles filenames with spaces)
find . -name "*.html" -not -path "*/node_modules/*" -not -path "*/.git/*" -print0 | while IFS= read -r -d '' file; do
  # Check if file already has security headers
  if ! grep -q "X-Content-Type-Options" "$file"; then
    echo "Processing: $file"
    
    # Add security headers after viewport meta tag or at beginning of head
    if grep -q '<meta name="viewport"' "$file"; then
      # Add after viewport
      sed -i '/<meta name="viewport".*\/>/a\
\
  <!-- Security Headers -->\
  <meta http-equiv="X-Content-Type-Options" content="nosniff" />\
  <meta http-equiv="X-Frame-Options" content="DENY" />\
  <meta http-equiv="X-XSS-Protection" content="1; mode=block" />\
  <meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin" />\
  <meta http-equiv="Permissions-Policy" content="geolocation=(), microphone=(), camera=(), payment=(), usb=()" />' "$file"
    elif grep -q '<meta charset=' "$file"; then
      # Add after charset
      sed -i '/<meta charset=.*>/a\
\
  <!-- Security Headers -->\
  <meta http-equiv="X-Content-Type-Options" content="nosniff" />\
  <meta http-equiv="X-Frame-Options" content="DENY" />\
  <meta http-equiv="X-XSS-Protection" content="1; mode=block" />\
  <meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin" />\
  <meta http-equiv="Permissions-Policy" content="geolocation=(), microphone=(), camera=(), payment=(), usb=()" />' "$file"
    fi
    
    echo "  ✓ Added security headers to $file"
  else
    echo "  ⊘ $file already has security headers"
  fi
done

echo ""
echo "✅ Security headers added successfully!"
echo ""
echo "Files processed. Please review the changes with:"
echo "  git diff"
