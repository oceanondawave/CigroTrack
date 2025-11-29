/**
 * Script to promote a user to ADMIN role in a team
 * 
 * Usage:
 *   npx ts-node scripts/promote-to-admin.ts <user-email> <team-name>
 * 
 * Example:
 *   npx ts-node scripts/promote-to-admin.ts admin@example.com "My Team"
 */

import { supabaseAdmin } from '../src/config/supabase'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

async function promoteToAdmin(userEmail: string, teamName: string) {
  try {
    console.log(`🔍 Looking for user: ${userEmail}`)
    
    // Find user by email
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, name, email')
      .eq('email', userEmail)
      .is('deleted_at', null)
      .single()

    if (userError || !userData) {
      console.error('❌ User not found:', userEmail)
      console.error('Error:', userError?.message)
      process.exit(1)
    }

    console.log(`✅ Found user: ${userData.name} (${userData.id})`)

    // Find team by name
    console.log(`🔍 Looking for team: ${teamName}`)
    const { data: teamData, error: teamError } = await supabaseAdmin
      .from('teams')
      .select('id, name')
      .eq('name', teamName)
      .is('deleted_at', null)
      .single()

    if (teamError || !teamData) {
      console.error('❌ Team not found:', teamName)
      console.error('Error:', teamError?.message)
      process.exit(1)
    }

    console.log(`✅ Found team: ${teamData.name} (${teamData.id})`)

    // Check if user is already a member
    const { data: memberData, error: memberError } = await supabaseAdmin
      .from('team_members')
      .select('id, role')
      .eq('team_id', teamData.id)
      .eq('user_id', userData.id)
      .single()

    if (memberError || !memberData) {
      console.error('❌ User is not a member of this team')
      console.error('Error:', memberError?.message)
      console.log('\n💡 Tip: First invite the user to the team, then run this script again.')
      process.exit(1)
    }

    console.log(`📋 Current role: ${memberData.role}`)

    if (memberData.role === 'ADMIN') {
      console.log('✅ User is already an ADMIN')
      process.exit(0)
    }

    if (memberData.role === 'OWNER') {
      console.log('⚠️  User is already the OWNER (cannot change)')
      process.exit(0)
    }

    // Promote to ADMIN
    console.log(`🔄 Promoting user to ADMIN...`)
    const { error: updateError } = await supabaseAdmin
      .from('team_members')
      .update({ role: 'ADMIN' })
      .eq('id', memberData.id)

    if (updateError) {
      console.error('❌ Failed to promote user:', updateError.message)
      process.exit(1)
    }

    console.log('✅ Successfully promoted user to ADMIN!')
    console.log(`\n📝 Summary:`)
    console.log(`   User: ${userData.name} (${userData.email})`)
    console.log(`   Team: ${teamData.name}`)
    console.log(`   New Role: ADMIN`)
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  }
}

// Get command line arguments
const args = process.argv.slice(2)

if (args.length < 2) {
  console.error('❌ Usage: npx tsx scripts/promote-to-admin.ts <user-email> <team-name>')
  console.error('\nExample:')
  console.error('  npx tsx scripts/promote-to-admin.ts admin@example.com "My Team"')
  process.exit(1)
}

const [userEmail, teamName] = args

promoteToAdmin(userEmail, teamName)
  .then(() => {
    console.log('\n✨ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })

