const AboutPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-8 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">About Wallet Compare</h2>
      <div className="prose prose-blue max-w-none">
        <p>
          Wallet Compare is a project created by Swapido to help Bitcoin users make informed choices about the wallets they use.
          Our goal is to provide accurate, up-to-date information about the features and capabilities of various Bitcoin wallets,
          with a focus on Lightning Network compatibility.
        </p>
        <p>
          The data in this comparison is compiled from various sources including:
        </p>
        <ul>
          <li>Official wallet documentation</li>
          <li>GitHub repositories and release notes</li>
          <li>User feedback and testing</li>
          <li>Direct communication with wallet developers</li>
        </ul>
        <p>
          We strive to keep this information current and accurate, but features and capabilities may change as wallets are updated.
          If you notice any discrepancies or have suggestions for improvement, please reach out to us.
        </p>
        <h3 className="text-xl font-semibold mt-6 mb-4">Our Methodology</h3>
        <p>
          Each wallet is evaluated based on a standard set of criteria, focusing on functionality, security, and usability.
          We test each feature directly when possible and consult with the developer community to ensure accuracy.
        </p>
        <p>
          Our ratings and evaluations are based on objective criteria and do not represent endorsements of any particular wallet.
          Different wallets excel in different areas, and the "best" wallet depends on your specific needs and preferences.
        </p>
        <h3 className="text-xl font-semibold mt-6 mb-4">Future Plans</h3>
        <p>
          We are continuously working to improve Wallet Compare with plans to:
        </p>
        <ul>
          <li>Expand our comparison to include more wallets</li>
          <li>Add detailed reviews and user experiences</li>
          <li>Integrate social metrics and developer activity indicators</li>
          <li>Create automated testing for feature verification</li>
          <li>Allow community contributions and verification</li>
        </ul>
        <h3 className="text-xl font-semibold mt-6 mb-4">About Swapido</h3>
        <p>
          Swapido is dedicated to improving the Bitcoin ecosystem through education, research, and development of tools
          that make Bitcoin more accessible and user-friendly. Wallet Compare is one of our initiatives to help 
          both newcomers and experienced users navigate the growing landscape of Bitcoin wallets.
        </p>
        <p>
          For more information about Swapido and our other projects, visit our website or follow us on Twitter.
        </p>
        <p>
          <strong>Contact:</strong> If you have any questions, feedback, or would like to contribute to this project,
          please contact us at info@swapido.com.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;
