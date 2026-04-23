const DOC_SECTIONS = [
  { id: 'intro', label: 'Welcome to TCOM', group: 'Getting Started' },
  { id: 'quickstart', label: 'Quick Start', group: 'Getting Started' },
  { id: 'auth', label: 'Login with X', group: 'Getting Started' },
  { id: 'profile', label: 'Your Profile', group: 'Getting Started' },
  { id: 'communities', label: 'Communities Overview', group: 'Communities' },
  { id: 'create-community', label: 'Creating a Community', group: 'Communities' },
  { id: 'customise', label: 'Customisation', group: 'Communities' },
  { id: 'visibility', label: 'Visibility & Access', group: 'Communities' },
  { id: 'joining', label: 'Joining & Leaving', group: 'Communities' },
  { id: 'posts', label: 'Posts', group: 'Content' },
  { id: 'replies', label: 'Replies & Threads', group: 'Content' },
  { id: 'likes', label: 'Likes', group: 'Content' },
  { id: 'media', label: 'Media', group: 'Content' },
  { id: 'roles', label: 'Roles & Permissions', group: 'Moderation' },
  { id: 'moderation', label: 'Moderation Tools', group: 'Moderation' },
  { id: 'reporting', label: 'Reporting', group: 'Moderation' },
];

const GROUPS = ['Getting Started', 'Communities', 'Content', 'Moderation'];

export default function Docs() {
  return (
    <div className="docs-page fade-in">
      <aside className="docs-sidebar">
        <div className="docs-sidebar-inner">
          <div className="docs-sidebar-brand">TrenchCom Docs</div>
          {GROUPS.map((group) => (
            <div key={group} className="docs-nav-group">
              <div className="docs-nav-group-label">{group}</div>
              {DOC_SECTIONS.filter((s) => s.group === group).map((s) => (
                <a key={s.id} href={`#${s.id}`} className="docs-nav-item">
                  {s.label}
                </a>
              ))}
            </div>
          ))}
        </div>
      </aside>

      <main className="docs-content">
        <section id="intro" className="docs-section">
          <div className="docs-eyebrow">Getting Started</div>
          <h1>Welcome to TCOM</h1>
          <p className="docs-lead">
            Trenches Community is home for crypto communities built around real X identity.
            It is designed for teams and holders that want X-native discussion structure,
            not noisy chat-room chaos.
          </p>
          <p>
            TCOM is familiar if you used X Communities: dedicated community pages, member lists,
            posting and replies, and moderation tooling. This docs page adapts the full `TCOM_docs.html`
            reference into an in-app guide with TrenchCom branding.
          </p>
        </section>

        <section id="quickstart" className="docs-section">
          <div className="docs-eyebrow">Getting Started</div>
          <h2>Quick Start</h2>
          <ol>
            <li>Log in with X.</li>
            <li>Create your community name + slug.</li>
            <li>Add banner and icon assets.</li>
            <li>Publish and pin your intro post.</li>
            <li>Share your community URL.</li>
          </ol>
        </section>

        <section id="auth" className="docs-section">
          <div className="docs-eyebrow">Getting Started</div>
          <h2>Login with X</h2>
          <p>TCOM uses X OAuth and no email/password auth.</p>
          <h3>What TCOM accesses from X</h3>
          <ul>
            <li><strong>users.read</strong> for profile identity fields.</li>
            <li><strong>tweet.read</strong> required by X OAuth flow.</li>
            <li><strong>offline.access</strong> to keep sessions persistent.</li>
          </ul>
          <h3>Profile sync</h3>
          <p>Avatar, display name, bio, and follower/following counts sync at login.</p>
          <h3>Session length</h3>
          <p>Typical session lifetime is 30 days, then re-authenticate with X.</p>
        </section>

        <section id="profile" className="docs-section">
          <div className="docs-eyebrow">Getting Started</div>
          <h2>Your Profile</h2>
          <p>
            Profiles mirror your X identity and display communities, handle, avatar, bio,
            and reputation context.
          </p>
        </section>

        <section id="communities" className="docs-section">
          <div className="docs-eyebrow">Communities</div>
          <h2>Communities Overview</h2>
          <p>Communities are organized by identity, members, and feed.</p>
          <ul>
            <li><strong>Identity:</strong> name, slug, banner, icon, description.</li>
            <li><strong>Members:</strong> real X users and role labels.</li>
            <li><strong>Feed:</strong> posts, replies, and moderation actions.</li>
          </ul>
        </section>

        <section id="create-community" className="docs-section">
          <div className="docs-eyebrow">Communities</div>
          <h2>Creating a Community</h2>
          <p>
            Provide name and slug, optionally description, visibility, and discovery tags.
            Slugs should be treated as permanent public identifiers.
          </p>
        </section>

        <section id="customise" className="docs-section">
          <div className="docs-eyebrow">Communities</div>
          <h2>Customisation</h2>
          <ul>
            <li><strong>Banner:</strong> recommended 1500×500.</li>
            <li><strong>Icon:</strong> recommended 400×400 square.</li>
            <li><strong>Name/Description:</strong> editable after creation.</li>
            <li><strong>Tags:</strong> improve discoverability.</li>
          </ul>
        </section>

        <section id="visibility" className="docs-section">
          <div className="docs-eyebrow">Communities</div>
          <h2>Visibility &amp; Access</h2>
          <h3>Public</h3>
          <p>Discoverable and joinable by everyone.</p>
          <h3>Private</h3>
          <p>Restricted visibility and controlled membership access.</p>
        </section>

        <section id="joining" className="docs-section">
          <div className="docs-eyebrow">Communities</div>
          <h2>Joining &amp; Leaving</h2>
          <p>Members can join public communities instantly and leave from community controls.</p>
        </section>

        <section id="posts" className="docs-section">
          <div className="docs-eyebrow">Content</div>
          <h2>Posts</h2>
          <ul>
            <li>Post body up to ~500 chars.</li>
            <li>Images supported in feed composer.</li>
            <li>Pinned posts stay above chronological feed.</li>
            <li>Author/mods can remove posts.</li>
          </ul>
        </section>

        <section id="replies" className="docs-section">
          <div className="docs-eyebrow">Content</div>
          <h2>Replies &amp; Threads</h2>
          <p>Replies are attached to posts and keep top-level feed clean.</p>
        </section>

        <section id="likes" className="docs-section">
          <div className="docs-eyebrow">Content</div>
          <h2>Likes</h2>
          <p>Like toggles are simple and public, optimized for signal over noise.</p>
        </section>

        <section id="media" className="docs-section">
          <div className="docs-eyebrow">Content</div>
          <h2>Media</h2>
          <p>Media is served via storage CDN and optimized for delivery performance.</p>
        </section>

        <section id="roles" className="docs-section">
          <div className="docs-eyebrow">Moderation</div>
          <h2>Roles &amp; Permissions</h2>
          <ul>
            <li><strong>Owner:</strong> full community control.</li>
            <li><strong>Moderator:</strong> content/member moderation actions.</li>
            <li><strong>Member:</strong> post, reply, like, and participate.</li>
          </ul>
        </section>

        <section id="moderation" className="docs-section">
          <div className="docs-eyebrow">Moderation</div>
          <h2>Moderation Tools</h2>
          <p>Delete content, remove/ban members, and pin important posts.</p>
        </section>

        <section id="reporting" className="docs-section">
          <div className="docs-eyebrow">Moderation</div>
          <h2>Reporting</h2>
          <p>Users can report violating content for platform-level review.</p>
        </section>

      </main>
    </div>
  );
}

