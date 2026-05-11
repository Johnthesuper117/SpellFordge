export function drawFrame({ ctx, canvas, state, settings, glyphForEnemy, glyphForBullet }) {
  const { paused, gameState, player, orbs, particles, damageNumbers, bullets, enemies, mouse } = state;

  ctx.fillStyle = '#050010';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#1a053322';
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
  for (let y = 0; y < canvas.height; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }

  if (paused && gameState === 'playing') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = 'bold 48px Cinzel, serif';
    ctx.fillStyle = '#e2c4ff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2 - 40);
    ctx.font = '16px Quicksand, sans-serif';
    ctx.fillStyle = '#a78bfa';
    ctx.fillText('Press P to resume', canvas.width / 2, canvas.height / 2 + 40);
    return;
  }

  orbs.forEach(o => {
    ctx.globalAlpha = o.life < 60 ? o.life / 60 : 1;
    ctx.beginPath();
    ctx.arc(o.x, o.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#10b981';
    ctx.shadowColor = '#10b981';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  });

  particles.forEach(p => {
    ctx.globalAlpha = p.life / 30;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * (p.life / 30), 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  damageNumbers.forEach(d => {
    ctx.globalAlpha = d.life / 60;
    ctx.font = 'bold 20px Cinzel, serif';
    ctx.fillStyle = d.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 4;
    ctx.fillText(d.damage, d.x, d.y);
    ctx.shadowBlur = 0;
  });
  ctx.globalAlpha = 1;

  bullets.forEach(b => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
    ctx.fillStyle = b.color;
    ctx.shadowColor = b.color;
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;
    const bulletGlyph = glyphForBullet(b, settings);
    if (bulletGlyph) {
      ctx.fillStyle = '#f8f5ff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      ctx.shadowBlur = 3;
      ctx.font = 'bold 12px Quicksand, sans-serif';
      ctx.fillText(bulletGlyph, b.x, b.y + 4);
      ctx.shadowBlur = 0;
    }
  });

  enemies.forEach(e => {
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
    let renderColor = e.color;
    if (e.flash > 0) renderColor = '#ffffff';
    else if (e.burn > 0) renderColor = '#ff6b35';
    else if (e.chill > 0) renderColor = '#38d9ff';
    ctx.fillStyle = renderColor;
    ctx.shadowColor = e.color;
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;

    const enemyGlyph = glyphForEnemy(e, settings);
    if (enemyGlyph) {
      ctx.fillStyle = '#f8f5ff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      ctx.shadowBlur = 4;
      ctx.font = 'bold 16px Cinzel, serif';
      ctx.fillText(enemyGlyph, e.x, e.y + 5);
      ctx.shadowBlur = 0;
    }

    if (e.burn > 0) {
      ctx.strokeStyle = `rgba(249, 115, 22, ${e.burn / 180})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.radius + 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    const bw = e.radius * 2;
    ctx.fillStyle = '#333';
    ctx.fillRect(e.x - bw / 2, e.y - e.radius - 8, bw, 4);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(e.x - bw / 2, e.y - e.radius - 8, bw * (e.hp / e.maxHp), 4);
  });

  if (player && (player.invuln % 4 < 2 || player.invuln === 0)) {
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#c084fc';
    ctx.shadowColor = player.shielded > 0 ? '#10b981' : '#7c3aed';
    ctx.shadowBlur = player.shielded > 0 ? 30 : 20;
    ctx.fill();
    ctx.shadowBlur = 0;

    if (player.shielded > 0) {
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.radius + 8, 0, Math.PI * 2);
      ctx.stroke();
    }

    const angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
    ctx.beginPath();
    ctx.arc(player.x + Math.cos(angle) * 7, player.y + Math.sin(angle) * 7, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
  }
}
