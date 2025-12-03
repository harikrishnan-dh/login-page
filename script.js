document.addEventListener('DOMContentLoaded', () => {
	const loginForm = document.getElementById('loginForm');
	const emailInput = document.getElementById('email');
	const passwordInput = document.getElementById('password');
	const showRegisterBtn = document.getElementById('showRegister');
	const registerSection = document.getElementById('registerSection');
	const registerForm = document.getElementById('registerForm');
	const rEmail = document.getElementById('r_email');
	const rPassword = document.getElementById('r_password');
	const rConfirm = document.getElementById('r_confirm');
	const cancelRegister = document.getElementById('cancelRegister');
	const result = document.getElementById('result');

	const STORAGE_KEY = 'unique_users';

	function loadUsers() {
		try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
		catch (e) { return []; }
	}

	function saveUsers(users) { localStorage.setItem(STORAGE_KEY, JSON.stringify(users)); }

	function findUserByEmail(email){
		if (!email) return null;
		return loadUsers().find(u => u.email.toLowerCase() === String(email).toLowerCase());
	}

	function encodePassword(p){ try { return btoa(String(p)); } catch(e){ return String(p); } }

	function escapeText(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[c]); }

	function getRandomColor(){ const hue = Math.floor(Math.random()*360); return `hsl(${hue} 85% 55%)`; }

	function showMessage(html, duration){
		result.classList.remove('hidden');
		result.innerHTML = html;
		if (duration) setTimeout(()=> result.classList.add('hidden'), duration);
	}

	function showLoginSuccess(user){
		const colorA = getRandomColor();
		const colorB = getRandomColor();
		const avatar = escapeText(user.email[0] || 'U').toUpperCase();
		showMessage(
			`<div class="result-card" style="background: linear-gradient(135deg, ${colorA}, ${colorB})">
					<div class="avatar">${avatar}</div>
					<div class="result-body">
						<div class="welcome">Welcome back</div>
						<div class="who">${escapeText(user.email)}</div>
					</div>
				</div>`
		);
	}

	function registerUser(email, password){
		if (findUserByEmail(email)) return { ok:false, msg: 'Account already exists' };
		const users = loadUsers();
		const user = { id: Date.now(), email, password: encodePassword(password), createdAt: Date.now() };
		users.push(user);
		saveUsers(users);
		return { ok:true, user };
	}

	function loginUser(email, password){
		const user = findUserByEmail(email);
		if (!user) return { ok:false, msg: 'No account found for this email' };
		if (user.password !== encodePassword(password)) return { ok:false, msg: 'Invalid password' };
		return { ok:true, user };
	}

	function toggleRegister(show){
		if (show) registerSection.classList.remove('hidden');
		else registerSection.classList.add('hidden');
	}

	loginForm.addEventListener('submit', (e) => {
		e.preventDefault();
		const email = emailInput.value.trim();
		const password = passwordInput.value;
		if (!email || !password) { showMessage('<div class="empty">Please enter email and password</div>', 2500); return; }
		const res = loginUser(email, password);
		if (!res.ok) {
			showMessage(`<div class="empty">${escapeText(res.msg)} — <button id=\"openReg\" class=\"muted small\">Create account</button></div>`);
			const openReg = document.getElementById('openReg');
			if (openReg) openReg.addEventListener('click', () => { toggleRegister(true); rEmail.value = email; rPassword.focus(); });
			return;
		}

		showLoginSuccess(res.user);
		loginForm.reset();
	});

	showRegisterBtn.addEventListener('click', () => { toggleRegister(true); rEmail.value = emailInput.value; rPassword.focus(); });
	cancelRegister.addEventListener('click', () => { toggleRegister(false); });

	registerForm.addEventListener('submit', (e) => {
		e.preventDefault();
		const email = rEmail.value.trim();
		const password = rPassword.value;
		const confirm = rConfirm.value;
		if (!email || !password || !confirm) { showMessage('<div class="empty">Please fill all registration fields</div>', 2200); return; }
		if (password.length < 6) { showMessage('<div class="empty">Password must be at least 6 characters</div>', 2200); return; }
		if (password !== confirm) { showMessage('<div class="empty">Passwords do not match</div>', 2200); return; }

		const res = registerUser(email, password);
		if (!res.ok) { showMessage(`<div class="empty">${escapeText(res.msg)}</div>`, 2200); return; }

		showMessage('<div class="stored-indicator">Account created</div>', 1600);
		toggleRegister(false);
		emailInput.value = email;
		passwordInput.value = '';
		passwordInput.focus();
	});

	// show quick count if any users saved
	const users = loadUsers();
	if (users.length) {
		showMessage(`<div class="stored-indicator">Saved accounts: ${users.length}</div>`, 1600);
	}

});
